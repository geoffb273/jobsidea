import { ActivityIndicator, ImageProps, StyleProp, View } from "react-native"
import ProfilePic from "./ProfilePic"
import Resume from "./Resume"
import TextWrapper from "./Text"
import { useQuery, gql } from '@apollo/client';

const GET_USER = gql`
    query USER ($username: String!) {
        user(username: $username) {
            username
            firstname
            lastname
            email
        }
    }
`

const ProfileComponent = ({username, style}: {username: string, style?: StyleProp<ImageProps>}) => {
    const { loading, data, error } = useQuery(GET_USER, 
        {variables: {username} }
    )
    if (loading) {
        return (
            <View style={style}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }
    if (error) {
       return (
            <View style={style}>
                <TextWrapper text="User not found" />
                <TextWrapper text="User not found" />
            </View>
        )
    }
    const { user } = data
    return (
        <View style={style}>
            <ProfilePic style={{width: "50px", height:"50px", borderRadius:50}} username={username}/>
            <TextWrapper text={user.firstname + " " + user.lastname} />
            <TextWrapper text={user.email} />
            <Resume style={{width:"100px", height:"100px"}} username={username}/>
        </View> 
    )
}

export default ProfileComponent