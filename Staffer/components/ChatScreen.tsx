import AsyncStorage from "@react-native-async-storage/async-storage"
import { ChatScreenProps } from "../types/NavStackTypes"
import CryptoJS from "react-native-crypto-js";
import api from "../api";
import { useEffect, useState } from "react";
import { Chat } from "../types/Chat";
import { Message } from "../types/Message";
import { FlatList, TextInput } from "react-native";
import MessageComponent from "./MessageComponent";

const ChatScreen = ({route, navigation} : ChatScreenProps) => {
    let {username, chatId} = route.params
    let [messages, setMessages] = useState<Array<Message>>([])
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

    const checkChat = async () => {
        try {
            let chat: Chat = await api.get_chat(chatId)
            if (!chat.users.includes(username)) {
                navigation.navigate("Login")
            }
        } catch (err) {
            navigation.navigate("Login")
        }
        
    }

    const getMessages = async() => {
        try {
            let ms: Array<Message> = await api.get_messages(username, chatId)
            if (ms) {
                setMessages(ms)
            }
        } catch(err) {

        }
    }

    useEffect(() => {
        checkLogin().then(() => {
            checkChat().then(() => {
                getMessages()
            }).catch(() => {
                navigation.navigate("Chats", {username: username})
            })
        }).catch(() => {
            navigation.navigate("Login")
        })
    })
    const renderMessageComponent = ({item}: {item: Message}) => {
        return <MessageComponent message={item} other={item.author != username}></MessageComponent>
    }
    return (
        <>
            <FlatList 
                renderItem={renderMessageComponent}
                data={messages}
                keyExtractor={item => item.id}
            />
            <TextInput style={{position: "absolute", bottom: 0, width: "100%"}}/>
        </>
    )
}

export default ChatScreen
