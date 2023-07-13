import { View } from "react-native";
import Button from "./Button";


const TabBar = ({username, navigation}: {username: string, navigation: any}) => {
    return (
        <View style={{display:"flex", flexDirection:"row", position:"absolute", bottom:"0", width:"100%", justifyContent:"space-evenly"}}>
            <Button title="Profile" style={{flex: 1}} onPress={()=>{navigation.push("Profile", {username: username})}}/>
            <Button title="Home" style={{flex:1}} onPress={()=>{navigation.push("Home", {username:username})}}/>
            <Button title="Chats" style={{flex: 1}} onPress={()=>{navigation.navigate("Chats", {username: username})}}/>
        </View>
    )
}

export default TabBar