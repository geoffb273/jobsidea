import { StyleSheet } from 'react-native';
import { Color } from '../constants/colorConstants';

const style = StyleSheet.create({
  dark: {
    backgroundColor: Color.BLACK,
    color: Color.WHITE,
    textAlign: 'center',
  },
  light: {
    backgroundColor: Color.WHITE,
    color: Color.BLACK,
    textAlign: 'center',
  },
  normal: {
    alignContent: 'center',
    minWidth: '100px',
  },
  tab: {
    flex: 1,
  },
});

export default style;
