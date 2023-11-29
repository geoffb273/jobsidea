import { useQuery, gql } from '@apollo/client';
import {
  type StyleProp,
  type ImageStyle,
  Image,
  View,
  ActivityIndicator,
} from 'react-native';
import { Color } from '../constants/colorConstants';

const GET_USER = gql`
  query USER($username: String!) {
    user(username: $username) {
      username
      resume
    }
  }
`;

const Resume = ({
  username,
  style,
}: {
  username: string;
  style?: StyleProp<ImageStyle>;
}) => {
  const { loading, data, error } = useQuery(GET_USER, {
    variables: { username },
  });

  if (loading) {
    return (
      <View style={[style, { backgroundColor: Color.WHITE }]}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return <View style={style} />;
  }
  const { user } = data;
  return (
    <Image
      source={{ uri: user.resume }}
      style={[style, { backgroundColor: Color.WHITE }]}
    />
  );
};

export default Resume;
