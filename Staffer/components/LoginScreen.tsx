import { SafeAreaView, TextInput, View} from 'react-native';
import { LoginScreenProps } from '../types/NavStackTypes';
import { useContext, useEffect, useState } from 'react';
import Button from './Button';
import Text from './Text';
import AuthContext from '../AuthContext';



const LoginScreen = ({route, navigation} : LoginScreenProps) => {
    let [username, setUsername] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState("")
    let { signIn } = useContext(AuthContext)
    

    return (
      <SafeAreaView style={{width: "100%", height: "100%"}}>
        <View>
          <Text text={error}></Text>
          <TextInput value={username} onChangeText={(text)=> {setUsername(text)}}/>
          <TextInput secureTextEntry={true} value={password} onChangeText={(text)=> {setPassword(text)}}/>
          <Button onPress={() => {signIn(username, password)}} title="Log In"/>
        </View>
      </SafeAreaView>
      
    );
  };

export default LoginScreen