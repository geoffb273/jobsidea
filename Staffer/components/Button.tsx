import { Appearance, GestureResponderEvent, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import ButtonStyle from "../styles/ButtonStyle"
import { useEffect, useState } from "react"

const Button = ({title, style, onPress}: 
    {title: string, style?: StyleProp<ViewStyle> | undefined, onPress:((event: GestureResponderEvent)=>any) | undefined}) => {
    let [dark, setDark] = useState(Appearance.getColorScheme() != "light")
    let textStyle = StyleSheet.flatten([style || {}, dark? ButtonStyle.dark: ButtonStyle.light])
    useEffect(() => {
        Appearance.addChangeListener(() => {
            setDark(!dark)
        })
    }, [])
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={ButtonStyle.normal}><Text style={textStyle}>{title}</Text></View>
        </TouchableOpacity>
        
    )
}

export default Button