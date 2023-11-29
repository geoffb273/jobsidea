import { type FC, useRef, useState } from 'react';

import { useQuery, useMutation, gql } from '@apollo/client';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TextInput,
  View,
} from 'react-native';

import Button from './Button';
import MessageComponent from './MessageComponent';
import type { Message } from '../types/Message';
import type { ChatScreenProps } from '../types/RootStackTypes';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import { Color } from '../constants/colorConstants';

const GET_CHAT = gql`
  query Chat($id: String!) {
    chat(id: $id) {
      id
      users {
        username
      }
      messages {
        created
        author
        content
        id
      }
    }
  }
`;

const PUT_MESSAGE = gql`
  mutation Message($message: MessageInput!) {
    message(message: $message) {
      id
      content
      author
      created
      chat {
        id
      }
    }
  }
`;

const ChatScreen: FC<ChatScreenProps> = ({
  route: {
    params: { chatId },
  },
}) => {
  const decodedChatId = decodeURIComponent(chatId);
  const messages = useRef<Message[]>([]);
  const [content, setContent] = useState('');
  const navigation = useNavigation();

  const {
    state: { username },
  } = useAuthContext();

  const { loading, data, error, refetch } = useQuery(GET_CHAT, {
    variables: { id: decodedChatId },
  });

  const [putMessage] = useMutation(PUT_MESSAGE);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    navigation.goBack();
    return <></>;
  }
  const { chat } = data;

  if (chat != null) {
    const ms = [];
    for (const m of chat.messages) {
      ms.push(m);
    }
    messages.current = ms.reverse();
    /*socket.emit("joined", {username: username, chatId: chat.id, unread: chat.unread})
        socket.on("joined", (data) =>{
            const msg: Message = {
                created: new Date().toISOString(),
                author: data.username,
                content: `${data.username} has joined the chat`,
                id: new Date().toISOString(),
                chatId: chat.id
            }
            messages.current.push(msg)
            setContent(content)
        })
        socket.on("chat message", (data) => {
            const msg: Message = {
                created: new Date().toISOString(),
                author: data.author,
                content: data.content,
                id: data.id,
                chatId: chat.id
            }
            messages.current.push(msg)
            setContent(content)
        })
    
        socket.on("user left", (data) => {
            const msg: Message = {
                created: new Date().toISOString(),
                author: data.username,
                content: `${data.username} has left the chat`,
                id: new Date().toISOString(),
                chatId: chat.id
            }
            messages.current.push(msg)
            setContent(content)
        })*/
  }

  const renderMessageComponent = ({ item }: { item: Message }) => {
    return <MessageComponent message={item} />;
  };

  const sendMessage = () => {
    if (content) {
      void putMessage({
        variables: {
          message: {
            author: username,
            content,
            chatId: decodedChatId,
          },
        },
      })
        .then(() => {
          void refetch();
        })
        .catch(err => {
          console.log(err);
          navigation.goBack();
        });
    }
  };

  return (
    <SafeAreaView
      style={{ position: 'absolute', height: '100%', width: '100%' }}
    >
      <Button
        title="Back"
        onPress={() => {
          navigation.goBack();
        }}
      />
      <FlatList
        renderItem={renderMessageComponent}
        data={messages.current}
        keyExtractor={item => item.id}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
          bottom: '0',
          width: '100%',
        }}
      >
        <TextInput
          style={{ backgroundColor: Color.LIGHTGRAY, flex: 9 }}
          value={content}
          onChangeText={text => {
            setContent(text);
          }}
        />
        <Button title="Send" style={{ flex: 1 }} onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
