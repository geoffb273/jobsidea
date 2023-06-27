import {FlatList, ListRenderItem} from 'react-native';
import { ChatsScreenProps } from '../types/NavStackTypes';
import api from '../api';
import { useEffect, useState } from 'react';
import TabBar from './TabBar';
import { Chat } from '../types/Chat';
import ChatComponent from './ChatComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from "react-native-crypto-js";
import Button from './Button';

const ChatsScreen = ({route, navigation} : ChatsScreenProps) => {
    let username: string = route.params.username
    let [chats, setChats] = useState<Array<Chat>>([])

    const checkLogin = async() => {
        let username_stored, encrypted
        try {
            username_stored = await AsyncStorage.getItem("username")
            encrypted = await AsyncStorage.getItem("password")
        } catch (err) {
            navigation.navigate("Login")
        }
        
        if (username_stored && encrypted) {
            if (username_stored != username) {
                navigation.navigate("Profile", {username: username})
                return
            }
            let decrypt = CryptoJS.AES.decrypt(encrypted, "grbrandt@190054")
            let password = decrypt.toString(CryptoJS.enc.Utf8)
            try {
                let user = await api.handle_login(username_stored, password)
                if (!user) {
                    navigation.navigate("Login")
                }
            } catch (err) {
                navigation.navigate("Login")
            }
        } else {
            navigation.navigate("Login")
        }
    }

    const setUpChats = function(chats: Array<Chat>) {
        setChats(chats)
    }

    useEffect(() => {
        checkLogin().then(() => {
            api.get_chats(username).then(chats => {
                setUpChats(chats)
            })
        })
        
    }, [])


    const logout = async function() {
        try {
            await AsyncStorage.removeItem("username")
            await AsyncStorage.removeItem("password")
        } catch(err) {

        }
        navigation.popToTop()
    }

    const renderChatComponent: ListRenderItem<Chat> = ({item}: {item: Chat}) => {
        const onPress = () => {
            navigation.navigate("Chat", {username: username, chatId: item.id})
        }
        return (
            <ChatComponent chat={item} username={username} onPress={onPress}/>
        )
    }
    return (
        <>
            <Button title='Log Out' onPress={logout}/>
            <FlatList 
                data={chats}
                renderItem={renderChatComponent}
                keyExtractor={item => item.id}
            />
            <TabBar username = {username} navigation={navigation}></TabBar>
        </>
    );
  };

export default ChatsScreen