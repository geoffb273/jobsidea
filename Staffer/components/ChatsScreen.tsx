import type { FC } from 'react';

import { useQuery, gql } from '@apollo/client';
import type { ListRenderItem } from 'react-native';
import { FlatList, SafeAreaView } from 'react-native';

import Button from './Button';
import ChatComponent from './ChatComponent';
import TabBar from './TabBar';
import TextWrapper from './Text';
import { useAuthContext } from '../contexts/AuthContext';
import type { Chat } from '../types/Chat';
import { useNavigation } from '@react-navigation/native';
import type { ChatsScreenProps } from '../types/RootStackTypes';
import { ScreenName } from '../constants/navigationConstants';

const GET_USER_CHATS = gql`
  query USER($username: String!) {
    user(username: $username) {
      username
      chats {
        id
        lastAccessed
        unread
        users {
          username
        }
      }
    }
  }
`;

const ChatsScreen: FC<ChatsScreenProps> = () => {
  const { signOut, state } = useAuthContext();
  const navigation = useNavigation<ChatsScreenProps['navigation']>();

  const { loading, data, error } = useQuery(GET_USER_CHATS, {
    variables: { username: state.username ?? '' },
  });
  if (loading) {
    return <TextWrapper text="Loading..." />;
  }
  if (error) {
    void signOut();
    return <></>;
  }

  const { user } = data;

  const renderChatComponent: ListRenderItem<Chat> = ({
    item,
  }: {
    item: Chat;
  }) => {
    const onPress = () => {
      navigation.push(ScreenName.CHAT, { chatId: item.id });
    };

    return <ChatComponent chat={item} onPress={onPress} />;
  };
  return (
    <SafeAreaView style={{ width: '100%', height: '100%' }}>
      <Button title="Log Out" onPress={signOut} />
      <FlatList
        data={user.chats}
        renderItem={renderChatComponent}
        keyExtractor={item => item.id}
      />
      <TabBar />
    </SafeAreaView>
  );
};

export default ChatsScreen;
