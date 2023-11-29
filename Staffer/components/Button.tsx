import { useEffect, useState } from 'react';

import {
  Appearance,
  type GestureResponderEvent,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import ButtonStyle from '../styles/ButtonStyle';

const Button = ({
  title,
  style,
  onPress,
}: {
  title: string;
  style?: StyleProp<ViewStyle> | undefined;
  onPress: ((event?: GestureResponderEvent) => void) | undefined;
}) => {
  const [dark, setDark] = useState(Appearance.getColorScheme() != 'light');
  const textStyle = StyleSheet.flatten([
    style || {},
    dark ? ButtonStyle.dark : ButtonStyle.light,
  ]);

  useEffect(() => {
    Appearance.addChangeListener(() => {
      setDark(!dark);
    });
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={ButtonStyle.normal}>
        <Text style={textStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;
