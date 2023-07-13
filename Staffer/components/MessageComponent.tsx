import { StyleSheet, View } from "react-native";
import { Message } from "../types/Message";
import Text from "./Text"


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
            <Text text={message.content} style={[style.both, other? style.other: style.self]} />
        </View>
    )
}


export default MessageComponent