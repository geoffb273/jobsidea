
import { useQuery } from "@tanstack/react-query"
import { Appearance, StyleProp, StyleSheet, Text, ImageStyle, Image, View, ActivityIndicator } from "react-native"
import api from "../api"
const ProfilePic = ({username, style}: {username: string, style?: StyleProp<ImageStyle>}) =>{
    const {isLoading, isError, data: url, error} = useQuery({
        queryKey: ["profilePic", username],
        queryFn: () => api.get_pic(username) 
    })

    if (isLoading) {
        return (
            <View style={style}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }

    if (isError) {
        return (
            <View style={style}/>
        )
    }

    return (
        <Image source={{uri: url}} style={style}/>
    )
}


export default ProfilePic