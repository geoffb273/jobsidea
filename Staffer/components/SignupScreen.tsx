import { SafeAreaView, TextInput, View} from 'react-native';
import { SignupScreenProps } from '../types/NavStackTypes';
import { useContext, useState } from 'react';
import Button from './Button';
import Text from './Text';
import AuthContext from '../AuthContext';



const SignupScreen = ({route, navigation} : SignupScreenProps) => {
    let [username, setUsername] = useState("")
    let [password, setPassword] = useState("")
    let [firstname, setFirst] = useState("")
    let [lastname, setLast] = useState("")
    let [email, setEmail] = useState("")
    let [phone, setPhone] = useState("")
    let [zipCode, setZipCode] = useState("")
    let [error, setError] = useState("")
    let { signUp } = useContext(AuthContext)
    let u = {
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        zipCode: zipCode
    }

    return (
      <SafeAreaView style={{width: "100%", height: "100%"}}>
        <View>
          <Text text={error}/>
          <TextInput value={firstname} onChangeText={(text)=> {setFirst(text)}}/>
          <TextInput value={lastname} onChangeText={(text)=> {setLast(text)}}/>
          <TextInput value={username} onChangeText={(text)=> {setUsername(text)}}/>
          <TextInput value={password} onChangeText={(text)=> {setPassword(text)}}/>
          <TextInput value={email} onChangeText={(text)=> {setEmail(text)}}/>
          <TextInput value={phone} onChangeText={(text)=> {setPhone(text)}}/>
          <TextInput value={zipCode} onChangeText={(text)=> {setZipCode(text)}}/>
          <Button onPress={() => {signUp(u)}} title="Log In"/>
        </View>
      </SafeAreaView>
      
    );
  };

export default SignupScreen