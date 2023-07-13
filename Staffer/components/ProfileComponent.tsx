import { ActivityIndicator, ImageProps, StyleProp, View } from "react-native"
import ProfilePic from "./ProfilePic"
import Resume from "./Resume"
import TextWrapper from "./Text"
import { useQuery } from "@tanstack/react-query";
import api from "../api"

const ProfileComponent = ({username, style}: {username: string, style?: StyleProp<ImageProps>}) => {
    const { isLoading, isError, data: user, error } = useQuery({
        queryKey: ['username', username],
        queryFn: () => api.get_user(username),
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
            <View style={style}>
                <TextWrapper text="User not found" />
                <TextWrapper text="User not found" />
            </View>
        )
    }
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