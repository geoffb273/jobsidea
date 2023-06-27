import { StyleSheet, Text, View } from "react-native";
import { Message } from "../types/Message";


const style = StyleSheet.create({
    self: {
        textAlign: "left"
    },
    other: {
        textAlign: "right"
    },
    both: {
        color: "white",
        width: "100%"
    }
})


const MessageComponent = ({message, other}: {message: Message, other: boolean}) => {
    return (
        <View style={{width: "100%"}}>
            <Text style={[style.both, other? style.other: style.self]}>{message.content}</Text>
        </View>
    )
}


export default MessageComponent