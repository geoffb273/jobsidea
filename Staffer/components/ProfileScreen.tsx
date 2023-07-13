import { ActivityIndicator, SafeAreaView } from 'react-native';
import { ProfileScreenProps } from '../types/NavStackTypes';
import TabBar from './TabBar';
import Button from './Button';
import ProfileComponent from './ProfileComponent';
import { useContext } from 'react';
import AuthContext from '../AuthContext';


const ProfileScreen = ({route, navigation} : ProfileScreenProps) => {
    let username: string = route.params.username
    let { signOut } = useContext(AuthContext)
    return (
        <SafeAreaView style={{width: "100%", height: "100%"}}>
            <Button title='Log Out' onPress={signOut}/>
            <ProfileComponent username={username}/>
            <TabBar username = {username} navigation={navigation}></TabBar>
        </SafeAreaView>
    );

}
    
    

export default ProfileScreen