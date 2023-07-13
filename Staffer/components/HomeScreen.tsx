import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { HomeScreenProps } from "../types/NavStackTypes";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { useContext, useRef, useState } from "react";
import ProfileComponent from "./ProfileComponent";
import Button from "./Button";
import TabBar from "./TabBar";
import AuthContext from "../AuthContext";


const HomeScreen = ({route, navigation} : HomeScreenProps) => {
    const { username } = route.params
    let [position, setPosition] = useState(0)
    let people = useRef<string[]>([])
    const limit = 1
    const { signOut } = useContext(AuthContext)

    const {
        isLoading,
        isError,
        error,
        data,
        isFetching,
        isPreviousData
    } = useQuery({
        queryKey: ["get_users", Math.floor(position / limit) * limit],
        queryFn: () => api.get_users("08043", Math.floor(position / limit) * limit, limit),
        keepPreviousData : true
    })
    if (isError) {
        navigation.navigate("Login")
    }
    if(data && !data.every((value: string) => people.current.includes(value))) {
        people.current = people.current.concat(data)
    }

    return (
      <SafeAreaView style={{position: "absolute", height:"100%", width:"100%"}}>
        <Button title='Log Out' onPress={signOut}/>
        <View>
            { isLoading || isFetching ? 
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