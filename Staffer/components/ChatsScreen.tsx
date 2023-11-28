import {FlatList, ListRenderItem, SafeAreaView} from 'react-native';
import { ChatsScreenProps } from '../types/NavStackTypes';
import api from '../api';
import TabBar from './TabBar';
import { Chat } from '../types/Chat';
import ChatComponent from './ChatComponent';
import Button from './Button';
import TextWrapper from './Text';
import { useQuery, gql } from '@apollo/client';
import { useContext } from 'react';
import AuthContext from '../AuthContext';

const GET_USER_CHATS = gql`
    query USER ($username: String!) {
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
`

const ChatsScreen = ({route, navigation} : ChatsScreenProps) => {
    let { signOut } = useContext(AuthContext)
    let username: string = route.params.username

    const { loading, data, error } = useQuery(GET_USER_CHATS, {
       variables: {username}
    })
    if (loading) {
        return <TextWrapper text='Loading...'/>
    }
    if (error) {
        signOut()
        return <></>
    }

    let { user } = data

    const renderChatComponent: ListRenderItem<Chat> = ({item}: {item: Chat}) => {
        const onPress = () => {
            navigation.navigate("Chat", {username: username, chatId: item.id})
        }
        return (
            <ChatComponent chat={item} username={username} onPress={onPress}/>
        )
    }
    return (
        <SafeAreaView style={{width: "100%", height: "100%"}}>
            <Button title='Log Out' onPress={signOut}/>
            <FlatList 
                data={user.chats}
                renderItem={renderChatComponent}
                keyExtractor={item => item.id}
            />
            <TabBar username = {username} navigation={navigation}></TabBar>
        </SafeAreaView>
    );
  };

export default ChatsScreen