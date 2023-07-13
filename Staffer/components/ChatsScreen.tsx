import {FlatList, ListRenderItem, SafeAreaView} from 'react-native';
import { ChatsScreenProps } from '../types/NavStackTypes';
import api from '../api';
import TabBar from './TabBar';
import { Chat } from '../types/Chat';
import ChatComponent from './ChatComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from "react-native-crypto-js";
import Button from './Button';
import { useQuery } from '@tanstack/react-query'
import TextWrapper from './Text';

const ChatsScreen = ({route, navigation} : ChatsScreenProps) => {
    let username: string = route.params.username
    
    const checkLogin = async() => {
        let username_stored, encrypted
        try {
            username_stored = await AsyncStorage.getItem("username")
            encrypted = await AsyncStorage.getItem("password")
        } catch (err) {
            return
        }
        
        if (username_stored && encrypted) {
            if (username_stored != username) {
                return
            }
            let decrypt = CryptoJS.AES.decrypt(encrypted, "grbrandt@190054")
            let password = decrypt.toString(CryptoJS.enc.Utf8)
            try {
                let user = await api.handle_login(username_stored, password)
                if (!user) {
                    return
                }
                return user
            } catch (err) {
                return
            }
        } else {
            return
        }
    }

    const { isLoading, isError, data: user, error } = useQuery({
        queryKey: ['checkLogin'],
        queryFn: checkLogin,
    })
    const { isLoading: loading, isError: hasError, data: chatData, error: err } = useQuery({
        queryKey: ["chats", username],
        queryFn: () => api.get_chats(username),
    })
    if (isLoading || loading) {
        return <TextWrapper text='Loading...'/>
    }
    if (isError || hasError) {
        navigation.navigate("Login")
        return <></>
    }
    
    
    const logout = async function() {
        try {
            await AsyncStorage.removeItem("username")
            await AsyncStorage.removeItem("password")
        } catch(err) {

        }
        navigation.navigate("Login")
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
        <SafeAreaView style={{width: "100%", height: "100%"}}>
            <Button title='Log Out' onPress={logout}/>
            <FlatList 
                data={chatData}
                renderItem={renderChatComponent}
                keyExtractor={item => item.id}
            />
            <TabBar username = {username} navigation={navigation}></TabBar>
        </SafeAreaView>
    );
  };

export default ChatsScreen