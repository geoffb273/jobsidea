import { TouchableOpacity } from 'react-native';

import ProfilePic from './ProfilePic';
import Text from './Text';
import type { Chat } from '../types/Chat';
import { useAuthContext } from '../contexts/AuthContext';

const ChatComponent = ({
  chat,
  onPress,
}: {
  chat: Chat;
  onPress: () => void;
}) => {
  const {
    state: { username },
  } = useAuthContext();

  const other =
    chat.users[0].username == username
      ? chat.users[1].username
      : chat.users[0].username;

  return (
    <TouchableOpacity onPress={onPress}>
      <ProfilePic
        style={{ width: '50px', height: '50px', borderRadius: 50 }}
        username={other}
      />
      <Text text={other} />
    </TouchableOpacity>
  );
};

export default ChatComponent;
