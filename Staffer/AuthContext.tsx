import { createContext } from "react";
type U = {
    username: string, 
    password: string, 
    firstname: string, 
    lastname: string, 
    phone: string, 
    email: string,
    zipCode: string
}
const AuthContext = createContext({
    signIn: async (username: string, password: string)=>{
        
    }, 
    signOut: async ()=>{
        
    }, 
    signUp: async (user: U)=>{
        
    }
});

export default AuthContext