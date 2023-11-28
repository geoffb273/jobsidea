import { Appearance, StyleProp, StyleSheet, Text, ImageStyle, Image, View, ActivityIndicator } from "react-native"
import { useQuery, gql } from '@apollo/client';

const GET_USER = gql`
    query USER ($username: String!) {
        user(username: $username) {
            username
            pic
        }
    }
`

const ProfilePic = ({username, style}: {username: string, style?: StyleProp<ImageStyle>}) =>{
    const {loading, data, error} = useQuery(GET_USER, {
       variables: { username }
    })

    if (loading) {
        return (
            <View style={style}>
                <ActivityIndicator size="large"/>
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
        <Image source={{uri: user.pic}} style={style}/>
    )
}


export default ProfilePic