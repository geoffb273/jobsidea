import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatsScreen from './components/ChatsScreen';
import ChatScreen from './components/ChatScreen';
import * as Linking from 'expo-linking'
import { Appearance } from 'react-native';
import BackgroundStyle from './styles/BackgroundStyle'
import { useState, useEffect, useReducer, useMemo } from 'react';
import { Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from './components/HomeScreen';
import CryptoJS from "react-native-crypto-js";
import AuthContext from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import SignupScreen from './components/SignupScreen';
import { ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';

const prefix = Linking.createURL('/');
const client = new ApolloClient({
  uri: "http://localhost:8000/",
  cache: new InMemoryCache()
})

const GET_USER = gql`
    query USER ($username: String!) {
        user(username: $username) {
            password
        }
    }
`
export default function App() {
  let [dark, setDark] = useState(Appearance.getColorScheme() != "light")
  useEffect(() => {
    Appearance.addChangeListener(() => {
        setDark(!dark)
    })
}, [])
  const Stack = createNativeStackNavigator();
  const contentStyle = dark ? BackgroundStyle.dark: BackgroundStyle.light
  const config = {
    screens: {
      Signup: "/signup",
      Login: "",
      Chats: ':username/chats',
      Profile: ':username/profile',
      Chat: ':username/chats/:chatId',
      Home: ':username'
    },
  };
  const linking = {
    prefixes: [prefix],
    config
  };

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_USER':
          return {
            ...prevState,
            username: action.username,
            password: action.password,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            username: action.username,
            password: action.password
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            username: null,
            password: null
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      username: null,
      password: null
    }
  );


  useEffect(() => {
    const checkLogin = async() => {

      let username_stored, encrypted
      try {
          username_stored = await AsyncStorage.getItem("username")
          encrypted = await AsyncStorage.getItem("password")
      } catch (err) {
          return null
      }
      
      if (username_stored && encrypted) {
          let decrypt = CryptoJS.SHA256.decrypt(encrypted, "grbrandt@190054")
          let password = decrypt.toString(CryptoJS.enc.Utf8)
          try {
              let user = await client.query({
                query: GET_USER,
                variables: { username: username_stored}
              })
              if (user) {
                dispatch({ type: 'RESTORE_USER', username: username_stored, password: password });
                return user
              }
              return null
          } catch (err) {
              return null
          }
      } else {
          return null
      }
  }

    checkLogin();
  }, []);
  const authContext = useMemo(
    () => ({
      signIn: async (username, password) => {
        try {
          
          let user = await api.handle_login(username, password)
          if (user) {
            try {
              await AsyncStorage.setItem("username", username)
              await AsyncStorage.setItem("password", CryptoJS.SHA256.encrypt(password, "grbrandt@190054"))
            } catch (err) {

            }
            dispatch({ type: 'SIGN_IN', username: username, password: password });
          }
        } catch(err) {

        }
        
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem("username")
          await AsyncStorage.removeItem("password")
        } catch(err) {

        }
        dispatch({ type: 'SIGN_OUT' })
      },
      signUp: async (data) => {
        let user = data
        try {
          await AsyncStorage.setItem("username", user.username)
          await AsyncStorage.setItem("password", CryptoJS.SHA256.encrypt(user.password, "grbrandt@190054"))
        } catch(err) {

        }
        try {
          //await api.post_user(user)
          dispatch({ type: 'SIGN_IN', username: user.username, password: user.password });
        } catch(err) {

        }
      },
    }),
    []
  );
  return (
    
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <AuthContext.Provider value={authContext}>
      <ApolloProvider client={client}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: contentStyle
        }}
      >
        { !state.username && !state.password ?
          <>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
          : 
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} initialParams={{username: state.username}}/>
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        }
      </Stack.Navigator>
      </ApolloProvider>
      </AuthContext.Provider>
    </NavigationContainer>
  );
}
