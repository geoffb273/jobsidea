import type { FC } from 'react';
import { SafeAreaView } from 'react-native';

import Button from './Button';
import ProfileComponent from './ProfileComponent';
import TabBar from './TabBar';
import { useAuthContext } from '../contexts/AuthContext';
import type { ProfileScreenProps } from '../types/RootStackTypes';

const ProfileScreen: FC<ProfileScreenProps> = ({ route: { params } }) => {
  const { signOut, state } = useAuthContext();

  return (
    <SafeAreaView style={{ width: '100%', height: '100%' }}>
      <Button title="Log Out" onPress={signOut} />
      <ProfileComponent username={params?.username ?? state.username ?? ''} />
      <TabBar />
    </SafeAreaView>
  );
};

export default ProfileScreen;
