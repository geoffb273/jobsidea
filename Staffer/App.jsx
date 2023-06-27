import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatsScreen from './components/ChatsScreen';
import ChatScreen from './components/ChatScreen';
import * as Linking from 'expo-linking'
import { Appearance } from 'react-native';
import BackgroundStyle from './styles/BackgroundStyle'
import { useState, useEffect } from 'react';

const prefix = Linking.createURL('/');

export default function App() {
  let [dark, setDark] = useState(Appearance.getColorScheme() != "light")
  console.log(dark)
  useEffect(() => {
    Appearance.addChangeListener(() => {
        setDark(!dark)
    })
}, [])
  const Stack = createNativeStackNavigator();
  const contentStyle = dark ? BackgroundStyle.dark: BackgroundStyle.light
  const config = {
    screens: {
      Login: "",
      Chats: ':username/chats',
      Profile: ':username',
      Chat: ':username/chats/:chatId'
    },
  };
  const linking = {
    prefixes: [prefix],
    config
  };


  return (
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: contentStyle
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chats" component={ChatsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
