import { useQuery, gql } from '@apollo/client';
import { Appearance, StyleProp, StyleSheet, ImageStyle, Image, View, ActivityIndicator } from "react-native"
import api from "../api"

const GET_USER = gql`
    query USER ($username: String!) {
        user(username: $username) {
            username
            resume
        }
    }
`

const Resume = ({username, style}: {username: string, style?: StyleProp<ImageStyle>}) =>{
    const {loading, data, error} = useQuery(GET_USER, {
        variables: { username }
    })

    if (loading) {
        return (
            <View style={[style, {backgroundColor:"white"}]}>
                <ActivityIndicator size="large" color="black"/>
            </View>
        )
    }

    if (error) {
        return (
            <View style={style}/>
        )
    }
    const { user } = data
    return (
        <Image source={{uri: user.resume}} style={[style, {backgroundColor:"white"}]}/>
    )
}

export default Resume