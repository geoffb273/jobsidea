import { useState } from 'react';

import { SafeAreaView, TextInput, View } from 'react-native';

import Button from './Button';
import Text from './Text';
import { useAuthContext } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');
  const { signIn } = useAuthContext();

  return (
    <SafeAreaView style={{ width: '100%', height: '100%' }}>
      <View>
        <Text text={error}></Text>
        <TextInput
          value={username}
          onChangeText={text => {
            setUsername(text);
          }}
        />
        <TextInput
          secureTextEntry={true}
          value={password}
          onChangeText={text => {
            setPassword(text);
          }}
        />
        <Button
          onPress={() => {
            void signIn(username, password);
          }}
          title="Log In"
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
