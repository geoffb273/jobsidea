import AsyncStorage from "@react-native-async-storage/async-storage"
import { ChatScreenProps } from "../types/NavStackTypes"
import CryptoJS from "react-native-crypto-js";
import api from "../api";
import { useRef, useState } from "react";
import { Chat } from "../types/Chat";
import { Message } from "../types/Message";
import { ActivityIndicator, FlatList, SafeAreaView, TextInput, View } from "react-native";
import MessageComponent from "./MessageComponent";
import Button from "./Button";
import socket from "../socket";
import { useQuery, useMutation } from "@tanstack/react-query";
import TextWrapper from "./Text";

const ChatScreen = ({route, navigation} : ChatScreenProps) => {
    let { username } = route.params
    let chatId = decodeURIComponent(route.params.chatId)
    let messages = useRef<Array<Message>>([])
    let [content, setContent] = useState("")

    const checkChat = async () => {
        try {
            let chat: Chat = await api.get_chat(chatId)
            if (!chat.users.includes(username)) {
                return
            }
            return chat
        } catch (err) {
            return
        }
    }
    const { isLoading, isError, data: user, error } = useQuery({
        queryKey: ['checkLogin'],
        queryFn: checkLogin,
    })

    const {isLoading: chatLoading, isError: chatError, data: chat, error: chErr} = useQuery({
        queryKey: ["checkChat"],
        queryFn: checkChat
    })

    const { isLoading: loading, isError: hasError, data: msgData, error: err } = useQuery({
        queryKey: ["chats", username, chatId],
        queryFn: () => api.get_messages(username, chatId),
    })
    if (isLoading || loading || chatLoading) {
        return <ActivityIndicator size="large"/>
    }
    if (isError) {
        navigation.navigate("Login")
        return <></>
    }
    if (chatError || hasError) {
        navigation.navigate("Chats", {username: username})
        return <></>
    }
    
    
    if (chat) {
        socket.emit("joined", {username: username, chatId: chat.id, unread: chat.unread})
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
        })
    }
    
    messages.current = msgData
    const renderMessageComponent = ({item}: {item: Message}) => {
        return <MessageComponent message={item} other={item.author != username}></MessageComponent>
    }

    const sendMessage = () => {
        if (content) {
            api.post_message({chatId: chatId, author: username, content: content}).then(ret => {
                messages.current.push(ret)
                socket.emit('chat message', ret);
                setContent("")
            }).catch(err => {
                navigation.navigate("Chats", {username: username})
            })
        }
    }

    return (
        <SafeAreaView style={{position: "absolute", height:"100%", width:"100%"}}>
            <Button title="Back" onPress={() => {navigation.navigate("Chats", {username: username})}}/>
            <FlatList 
                renderItem={renderMessageComponent}
                data={messages.current}
                keyExtractor={item => item.id}
            />
            <View style={{display:"flex", flexDirection:"row", position:"absolute", bottom:"0", width:"100%"}}>
                <TextInput style={{backgroundColor: "lightgray", flex:9}} value={content} onChangeText={(text)=> {setContent(text)}}/>
                <Button title="Send" style={{flex:1}} onPress={sendMessage}/>
            </View>
            
        </SafeAreaView>
    )
}

export default ChatScreen
