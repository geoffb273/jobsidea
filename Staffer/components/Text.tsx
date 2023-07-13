
import { Appearance, StyleProp, StyleSheet, Text, TextStyle } from "react-native"
import TextSt from "../styles/TextStyle"
import { useEffect, useState } from "react"

const TextWrapper = ({text, style}: { text: string, style?: StyleProp<TextStyle>}) => {
    let [dark, setDark] = useState(Appearance.getColorScheme() != "light")
    let textStyle = StyleSheet.flatten([ style || {}, dark? TextSt.dark: TextSt.light])
    useEffect(() => {
        Appearance.addChangeListener(() => {
            setDark(!dark)
        })
    }, [])
    return (
        <Text style={textStyle}>{text}</Text>
        
    )
}

export default TextWrapper