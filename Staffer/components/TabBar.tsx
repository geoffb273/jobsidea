import { View } from 'react-native';

import Button from './Button';
import { useNavigation } from '@react-navigation/native';
import { ScreenName } from '../constants/navigationConstants';

const TabBar = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        bottom: '0',
        width: '100%',
        justifyContent: 'space-evenly',
      }}
    >
      <Button
        title="Profile"
        style={{ flex: 1 }}
        onPress={() => {
          navigation.navigate(ScreenName.PROFILE);
        }}
      />
      <Button
        title="Home"
        style={{ flex: 1 }}
        onPress={() => {
          navigation.navigate(ScreenName.HOME);
        }}
      />
      <Button
        title="Chats"
        style={{ flex: 1 }}
        onPress={() => {
          navigation.navigate(ScreenName.CHATS);
        }}
      />
    </View>
  );
};

export default TabBar;
