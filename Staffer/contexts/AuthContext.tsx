import { createContext, useContext } from 'react';
import type { LoginState } from '../providers/AuthProvider';

type U = {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  zipCode: string;
};

type AuthContextType = {
  signIn: (username: string, password: string) => Promise<void | null> | null;
  signOut: () => void;
  signUp: (user: U) => Promise<void | null> | null;
  state: LoginState;
};

const defaultAuthContext: AuthContextType = {
  signIn: (_username: string, _password: string) => null,
  signOut: () => null,
  signUp: (_user: U) => null,
  state: {
    isLoading: false,
    isSignout: false,
    username: null,
    password: null,
  },
};

const AuthContext = createContext(defaultAuthContext);

const useAuthContext = () => useContext(AuthContext);

export { type AuthContextType, AuthContext, useAuthContext };
