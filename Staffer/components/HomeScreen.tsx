import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { HomeScreenProps } from "../types/NavStackTypes";
import { gql, useLazyQuery } from "@apollo/client";
import api from "../api";
import { useContext, useRef, useState } from "react";
import ProfileComponent from "./ProfileComponent";
import Button from "./Button";
import TabBar from "./TabBar";
import AuthContext from "../AuthContext";

const GET_USER = gql`
    query Users($zipCode: String!) {
        users(zipCode: $zipCode) {
            username
            firstname
            lastname
            email
            zipCode
        }
    }
`

const HomeScreen = ({route, navigation} : HomeScreenProps) => {
    const { username } = route.params
    let [position, setPosition] = useState(0)
    let people = useRef<string[]>([])
    const limit = 1
    const { signOut } = useContext(AuthContext)

    const [getUsers, {loading, data, error}] = useLazyQuery(GET_USER)
    if (error) {
        signOut()
    }
    if(data && !data.every((value: string) => people.current.includes(value))) {
        people.current = people.current.concat(data)
    }

    return (
      <SafeAreaView style={{position: "absolute", height:"100%", width:"100%"}}>
        <Button title='Log Out' onPress={signOut}/>
        <View>
            { loading ? 
                <ActivityIndicator size="large"/> :
                <>
                    <ProfileComponent username={people.current[position]}/>
                    {position > 0? <Button title="Prev" onPress={()=>{setPosition(position - 1)}}/>: <></>}
                    {position <= people.current.length? <Button title="Next" onPress={()=>{setPosition(position + 1)}}/>: <></>}
                </>
            }
            
        </View>
        <TabBar username={username} navigation={navigation} />
      </SafeAreaView>
      
    );
  };

export default HomeScreen