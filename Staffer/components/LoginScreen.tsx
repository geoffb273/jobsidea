import {Text, TextInput, View} from 'react-native';
import { LoginScreenProps } from '../types/NavStackTypes';
import { useEffect, useState } from 'react';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from "react-native-crypto-js";
import Button from './Button';



const LoginScreen = ({route, navigation} : LoginScreenProps) => {
    let [username, setUsername] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState("")

    const checkPasswords = async() => {
      try {
        let username = await AsyncStorage.getItem("username")
        let encrypted = await AsyncStorage.getItem("password")
        if (username && encrypted) {
          let decrypt = CryptoJS.AES.decrypt(encrypted, "grbrandt@190054")
          let password = decrypt.toString(CryptoJS.enc.Utf8)
          setUsername(username)
          setPassword(password)
          handleLogin(username, password, false)
        }
        
      } catch(err) {

      }
    }

    useEffect(() => {
      checkPasswords()
    }, [])

    const handleLogin = async function(username: string, password: string, save: boolean = true) {
        let user = await api.handle_login(username, password)
        if (user) {
          if (save) {
            try {
              await AsyncStorage.setItem("username", username)
              let encrypt = CryptoJS.AES.encrypt(password, "grbrandt@190054").toString()
              await AsyncStorage.setItem("password", encrypt)
            } catch(err) {

            }
          }
          navigation.navigate("Profile", {username: user.username})
        } else {
          try {
            await AsyncStorage.removeItem("username")
            await AsyncStorage.removeItem("password")
          } catch(err) {

          }
          setUsername("")
          setPassword("")
          setError("Incorrect Username or Password")
        }
    }

    return (
      <View>
          <Text>{error}</Text>
          <TextInput value={username} onChangeText={(text)=> {setUsername(text)}}/>
          <TextInput secureTextEntry={true} value={password} onChangeText={(text)=> {setPassword(text)}}/>
          <Button onPress={() => {handleLogin(username, password)}} title="Log In"/>
      </View>
    );
  };

export default LoginScreen