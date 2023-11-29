import { StyleSheet, View } from 'react-native';

import Text from './Text';
import type { Message } from '../types/Message';
import { useAuthContext } from '../contexts/AuthContext';
import { Color } from '../constants/colorConstants';

const MessageComponent = ({ message }: { message: Message }) => {
  const {
    state: { username },
  } = useAuthContext();
  const other = username !== message.author;
  return (
    <View style={{ width: '100%' }}>
      <Text
        text={message.content}
        style={[style.both, other ? style.other : style.self]}
      />
    </View>
  );
};

const style = StyleSheet.create({
  both: {
    color: Color.WHITE,
    width: '100%',
  },
  other: {
    textAlign: 'right',
  },
  self: {
    textAlign: 'left',
  },
});

export default MessageComponent;
