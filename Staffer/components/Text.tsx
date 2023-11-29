import { useEffect, useState } from 'react';

import {
  Appearance,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
} from 'react-native';

import TextSt from '../styles/TextStyle';

const TextWrapper = ({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) => {
  const [dark, setDark] = useState(Appearance.getColorScheme() != 'light');
  const textStyle = StyleSheet.flatten([
    style || {},
    dark ? TextSt.dark : TextSt.light,
  ]);
  useEffect(() => {
    Appearance.addChangeListener(() => {
      setDark(!dark);
    });
  }, []);
  return <Text style={textStyle}>{text}</Text>;
};

export default TextWrapper;
