import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ScreenName } from '../constants/navigationConstants';

export type RootStackParamList = {
  [ScreenName.LOG_IN]: undefined;
  [ScreenName.SIGN_UP]: undefined;
  [ScreenName.PROFILE]: { username: string } | undefined;
  [ScreenName.CHATS]: undefined;
  [ScreenName.CHAT]: { chatId: string };
  [ScreenName.HOME]: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LOG_IN'
>;

export type SignupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SIGN_UP'
>;
export type ProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PROFILE'
>;
export type ChatsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CHATS'
>;
export type ChatScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CHAT'
>;
export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'HOME'
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
