import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Text } from 'react-native';

import AuthProvider from './providers/AuthProvider';
import RootNavigator from './navigators/RootNavigator';

const prefix = Linking.createURL('/');
const client = new ApolloClient({
  uri: 'http://localhost:8000/',
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ['username'],
      },
      Chat: {
        keyFields: ['id'],
      },
      Message: {
        keyFields: ['id'],
      },
    },
  }),
});

export default function App() {
  const config = {
    screens: {
      Signup: '/signup',
      Login: '',
      Chats: ':username/chats',
      Profile: ':username/profile',
      Chat: ':username/chats/:chatId',
      Home: ':username',
    },
  };
  const linking = {
    prefixes: [prefix],
    config,
  };

  return (
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <ApolloProvider client={client}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ApolloProvider>
    </NavigationContainer>
  );
}
