import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Profile: {username: string};
  Chats: {username: string};
  Chat: {username: string, chatId: string};
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type ChatsScreenProps = NativeStackScreenProps<RootStackParamList, 'Chats'>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;