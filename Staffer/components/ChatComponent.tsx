import { Image, TouchableOpacity } from "react-native";
import { Chat } from "../types/Chat";
import { useEffect, useState } from "react";
import api from "../api";
import Text from "./Text";
import ProfilePic from "./ProfilePic";



const ChatComponent = ({chat, username, onPress}: {chat: Chat, username: string, onPress: () => void}) => {
    const other = chat.users[0] == username ? chat.users[1]: chat.users[0]
    
    return (
        <TouchableOpacity onPress={onPress}>
            <ProfilePic style={{width: "50px", height: "50px", borderRadius:50}} username={other}/>
            <Text text={other} />
        </TouchableOpacity>
    )
}

export default ChatComponent