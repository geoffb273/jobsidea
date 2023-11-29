import {
  type ReactNode,
  type Reducer,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { gql, useApolloClient } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'react-native-crypto-js';

import type { AuthContextType } from '../contexts/AuthContext';
import { AuthContext } from '../contexts/AuthContext';

export type LoginState = {
  username?: string | null;
  password?: string | null;
  isLoading: boolean;
  isSignout: boolean;
};

type LoginAction = {
  type: string;
  username?: string | null;
  password?: string | null;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer<Reducer<LoginState, LoginAction>>(
    (prevState: LoginState, action: LoginAction) => {
      switch (action.type) {
        case 'RESTORE_USER':
          return {
            ...prevState,
            username: action.username,
            password: action.password,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            username: action.username,
            password: action.password,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            username: null,
            password: null,
          };
        default: {
          return {
            isLoading: false,
            isSignout: false,
            username: null,
            password: null,
          };
        }
      }
    },
    {
      isLoading: true,
      isSignout: false,
      username: null,
      password: null,
    },
  );

  const GET_USER = gql`
    query Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        username
        password
      }
    }
  `;

  const client = useApolloClient();
  useEffect(() => {
    const checkLogin = async () => {
      let username_stored: string | null | undefined,
        encrypted: string | null | undefined;
      try {
        username_stored = await AsyncStorage.getItem('username');
        encrypted = await AsyncStorage.getItem('password');
      } catch (err) {
        return false;
      }
      if (username_stored != null && encrypted != null) {
        const decrypt = CryptoJS.AES.decrypt(encrypted, 'grbrandt@190054');
        const password = decrypt.toString(CryptoJS.enc.Utf8);
        try {
          const { data } = await client.query({
            query: GET_USER,
            variables: { username: username_stored, password },
          });

          const { login: user } = data;
          if (user != null) {
            dispatch({
              type: 'RESTORE_USER',
              username: username_stored,
              password: password,
            });
            return true;
          }
          return null;
        } catch (err) {
          return false;
        }
      }
      return false;
    };

    void checkLogin();
  }, []);
  const authContext: AuthContextType = useMemo(
    () => ({
      signIn: async (username: string, password: string) => {
        try {
          const { data } = await client.query({
            query: GET_USER,
            variables: { username: username, password: password },
          });
          const { login: user } = data;

          if (user) {
            try {
              await AsyncStorage.setItem('username', username);
              await AsyncStorage.setItem(
                'password',
                CryptoJS.AES.encrypt(password, 'grbrandt@190054').toString(),
              );
            } catch (err) {
              console.error(err);
            }
            dispatch({
              type: 'SIGN_IN',
              username: username,
              password: password,
            });
          }
        } catch (err) {
          console.log(err);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
        } catch (err) {
          console.error(err);
        }
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async data => {
        const user = data;
        try {
          await AsyncStorage.setItem('username', user.username);
          await AsyncStorage.setItem(
            'password',
            CryptoJS.AES.encrypt(user.password, 'grbrandt@190054').toString(),
          );
        } catch (err) {
          console.error(err);
        }
        try {
          dispatch({
            type: 'SIGN_IN',
            username: user.username,
            password: user.password,
          });
        } catch (err) {
          console.error(err);
        }
      },
      state,
    }),
    [state],
  );
  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
