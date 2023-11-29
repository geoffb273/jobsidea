import { type FC, useRef, useState } from 'react';

import { gql, useLazyQuery } from '@apollo/client';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';

import Button from './Button';
import ProfileComponent from './ProfileComponent';
import TabBar from './TabBar';
import { useAuthContext } from '../contexts/AuthContext';

const GET_USER = gql`
  query Users($zipCode: String!) {
    users(zipCode: $zipCode) {
      username
      firstname
      lastname
      email
      zipCode
    }
  }
`;

const HomeScreen: FC = () => {
  const [position, setPosition] = useState(0);
  const people = useRef<string[]>([]);
  const { signOut } = useAuthContext();

  const [, { loading, data, error }] = useLazyQuery(GET_USER);
  if (error) {
    void signOut();
  }
  if (data && !data.every((value: string) => people.current.includes(value))) {
    people.current = people.current.concat(data as string[]);
  }

  return (
    <SafeAreaView
      style={{ position: 'absolute', height: '100%', width: '100%' }}
    >
      <Button title="Log Out" onPress={signOut} />
      <View>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <ProfileComponent username={people.current[position]} />
            {position > 0 ? (
              <Button
                title="Prev"
                onPress={() => {
                  setPosition(position - 1);
                }}
              />
            ) : (
              <></>
            )}
            {position <= people.current.length ? (
              <Button
                title="Next"
                onPress={() => {
                  setPosition(position + 1);
                }}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </View>
      <TabBar />
    </SafeAreaView>
  );
};

export default HomeScreen;
