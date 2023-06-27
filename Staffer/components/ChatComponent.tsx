import { Image, Text, TouchableOpacity } from "react-native";
import { Chat } from "../types/Chat";
import { useEffect, useState } from "react";
import api from "../api";



const ChatComponent = ({chat, username, onPress}: {chat: Chat, username: string, onPress: () => void}) => {
    const other = chat.users[0] == username ? chat.users[1]: chat.users[0]
    let [url, setUrl] = useState("")
    useEffect(()=> {
        api.get_pic(other).then(u => {
            if (u) {
                setUrl(u)
            }
        })
    }, [])
    return (
        <TouchableOpacity onPress={onPress}>
            <Image style={{width: "50px", height: "50px"}} source={{uri: url}}/>
            <Text>{other}</Text>
        </TouchableOpacity>
    )
}

export default ChatComponent