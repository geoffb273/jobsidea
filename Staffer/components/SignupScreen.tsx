import { useState } from 'react';
import { SafeAreaView, TextInput, View } from 'react-native';

import Button from './Button';
import Text from './Text';
import { useAuthContext } from '../contexts/AuthContext';

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirst] = useState('');
  const [lastname, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error] = useState('');
  const { signUp } = useAuthContext();
  const u = {
    username,
    password,
    firstname,
    lastname,
    email,
    phone,
    zipCode,
  };

  return (
    <SafeAreaView style={{ width: '100%', height: '100%' }}>
      <View>
        <Text text={error} />
        <TextInput
          value={firstname}
          onChangeText={text => {
            setFirst(text);
          }}
        />
        <TextInput
          value={lastname}
          onChangeText={text => {
            setLast(text);
          }}
        />
        <TextInput
          value={username}
          onChangeText={text => {
            setUsername(text);
          }}
        />
        <TextInput
          value={password}
          onChangeText={text => {
            setPassword(text);
          }}
        />
        <TextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
          }}
        />
        <TextInput
          value={phone}
          onChangeText={text => {
            setPhone(text);
          }}
        />
        <TextInput
          value={zipCode}
          onChangeText={text => {
            setZipCode(text);
          }}
        />
        <Button
          onPress={() => {
            void signUp(u);
          }}
          title="Log In"
        />
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;
