import { View } from "react-native";
import Button from "./Button";


const TabBar = ({username, navigation}: {username: string, navigation: any}) => {
    return (
        <View style={{display:"flex", flexDirection:"row"}}>
            <Button title="Profile" onPress={()=>{navigation.push("Profile", {username: username})}}/>
            <Button title="Chats" onPress={()=>{navigation.navigate("Chats", {username: username})}}/>
        </View>
    )
}

export default TabBar