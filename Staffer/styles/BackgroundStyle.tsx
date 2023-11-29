import { StyleSheet } from 'react-native';
import { Color } from '../constants/colorConstants';

const style = StyleSheet.create({
  dark: {
    backgroundColor: Color.BLACK,
    color: Color.WHITE,
  },
  light: {
    backgroundColor: Color.WHITE,
    color: Color.BLACK,
  },
});

export default style;
