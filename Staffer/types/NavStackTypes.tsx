import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Profile: {username: string};
  Chats: {username: string};
  Chat: {username: string, chatId: string};
  Home: {username: string};
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type ChatsScreenProps = NativeStackScreenProps<RootStackParamList, 'Chats'>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;