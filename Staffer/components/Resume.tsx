import { useQuery } from "@tanstack/react-query"
import { Appearance, StyleProp, StyleSheet, ImageStyle, Image, View, ActivityIndicator } from "react-native"
import api from "../api"
const Resume = ({username, style}: {username: string, style?: StyleProp<ImageStyle>}) =>{
    const {isLoading, isError, data: url, error} = useQuery({
        queryKey: ["resume", username],
        queryFn: () => api.get_resume(username) 
    })

    if (isLoading) {
        return (
            <View style={[style, {backgroundColor:"white"}]}>
                <ActivityIndicator size="large" color="black"/>
            </View>
        )
    }

    if (isError) {
        return (
            <View style={style}/>
        )
    }
    return (
        <Image source={{uri: url}} style={[style, {backgroundColor:"white"}]}/>
    )
}

export default Resume