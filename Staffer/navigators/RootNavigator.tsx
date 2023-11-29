import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../components/ChatScreen';
import ChatsScreen from '../components/ChatsScreen';
import HomeScreen from '../components/HomeScreen';
import LoginScreen from '../components/LoginScreen';
import ProfileScreen from '../components/ProfileScreen';
import SignupScreen from '../components/SignupScreen';
import { useAuthContext } from '../contexts/AuthContext';
import BackgroundStyle from '../styles/BackgroundStyle';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import type { RootStackParamList } from '../types/RootStackTypes';
import { ScreenName } from '../constants/navigationConstants';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { state } = useAuthContext();
  const [dark, setDark] = useState(Appearance.getColorScheme() != 'light');

  useEffect(() => {
    Appearance.addChangeListener(() => {
      setDark(!dark);
    });
  }, []);

  const contentStyle = dark ? BackgroundStyle.dark : BackgroundStyle.light;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle,
      }}
    >
      {!state.username && !state.password ? (
        <>
          <Stack.Screen name={ScreenName.LOG_IN} component={LoginScreen} />
          <Stack.Screen name={ScreenName.SIGN_UP} component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name={ScreenName.PROFILE}
            component={ProfileScreen}
            initialParams={
              state.username != null ? { username: state.username } : undefined
            }
          />
          <Stack.Screen name={ScreenName.CHATS} component={ChatsScreen} />
          <Stack.Screen name={ScreenName.CHAT} component={ChatScreen} />
          <Stack.Screen name={ScreenName.HOME} component={HomeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
