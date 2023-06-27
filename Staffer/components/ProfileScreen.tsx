import {Image, Text, View} from 'react-native';
import { ProfileScreenProps } from '../types/NavStackTypes';
import { User } from '../types/User';
import api from '../api';
import { useEffect, useState } from 'react';
import TabBar from './TabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from "react-native-crypto-js";
import Button from './Button';


const ProfileScreen = ({route, navigation} : ProfileScreenProps) => {
    let username: string = route.params.username
    let [user, setUser] = useState<User>({username: "", firstname: "", lastname: "", email: "", pic: undefined, resume: undefined, phone: undefined})
    let [loggedUser, setLoggedUser] = useState<User>({username: "", firstname: "", lastname: "", email: "", pic: undefined, resume: undefined, phone: undefined})
    let [url, setUrl] = useState("")
    let [resume, setResume] = useState("")
    let [own, setOwn] = useState(false)
    let [logged, setLogged] = useState(false)

    const checkLogin = async () => {
        let username_stored, encrypted
        try {
            username_stored = await AsyncStorage.getItem("username")
            encrypted = await AsyncStorage.getItem("password")
        } catch (err) {
            return
        }
        if (username_stored && encrypted) {
          let decrypt = CryptoJS.AES.decrypt(encrypted, "grbrandt@190054")
          let password = decrypt.toString(CryptoJS.enc.Utf8)
          try {
            let user = await api.handle_login(username_stored, password)
            if (user) {
                setLoggedUser(user)
                setLogged(true)
                if (user.username == username) {
                    setOwn(true)
                }
            } else {
                return;
            }
          } catch (err) {
            return;
          }
        }
    }

    useEffect(() => {
        api.get_user(username).then(user => {
            checkLogin()
            setUser(user)
            if (user.pic) {
                api.get_pic(user.username).then(url => {
                    setUrl(url)
                })
            }
            if (user.resume) {
                api.get_resume(user.username).then(url => {
                    setResume(url)
                })
            }
        })
    }, [])

    const logout = async function() {
        if (logged) {
            try {
                await AsyncStorage.removeItem("username")
                await AsyncStorage.removeItem("password")
            } catch(err) {
    
            }
        }
        navigation.navigate("Login")
    }
    
    

    return (
        <>
            <Button title={logged?'Log Out':"Log In"} onPress={logout}/>
            <View >
                <Image style={{width: "50px", height:"50px"}} source={{"uri": url}}/>
                <Text>{user.firstname} {user.lastname}</Text>
                <Text>{user.email}</Text>
                <Image style={{height:"50px", width:"50px"}} source={{"uri": resume}}/>
            </View>
            {logged?<TabBar username = {loggedUser.username} navigation={navigation}></TabBar>:<></>}
        </>
    );
  };

export default ProfileScreen