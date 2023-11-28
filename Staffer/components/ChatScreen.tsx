import { ChatScreenProps } from "../types/NavStackTypes"
import { useRef, useState } from "react";
import { Message } from "../types/Message";
import { ActivityIndicator, FlatList, SafeAreaView, TextInput, View } from "react-native";
import MessageComponent from "./MessageComponent";
import Button from "./Button";
import { useQuery, useMutation, gql } from "@apollo/client";

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
`

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

`


const ChatScreen = ({route, navigation} : ChatScreenProps) => {
    let { username } = route.params
    let chatId = decodeURIComponent(route.params.chatId)
    let messages = useRef<Array<Message>>([])
    let [content, setContent] = useState("")


    const {loading, data, error, refetch} = useQuery( GET_CHAT, {
        variables: {id: chatId}
    })

    const [putMessage] = useMutation(PUT_MESSAGE)
    
    if ( loading) {
        return <ActivityIndicator size="large"/>
    }
    
    if (error) {
        navigation.navigate("Chats", {username: username})
        return <></>
    }
    const { chat } = data


    
    if (chat) {
        let ms = []
        for (let m of chat.messages) {
            ms.push(m)
        }
        messages.current = ms.reverse()
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
    
    
    const renderMessageComponent = ({item}: {item: Message}) => {
        return <MessageComponent message={item} other={item.author != username}></MessageComponent>
    }

    const sendMessage = () => {
        if (content) {
            putMessage({
                variables: {
                    message: {
                        author: username,
                        content: content,
                        chatId: chatId
                    }
                }
            }).then(() => {
                refetch()
            }).catch(err => {
                console.log(err)
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
