import { Text, View } from 'react-native';
import { EditProfileScreen } from './screens/EditProfileScreen';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>caca</Text>
      <EditProfileScreen></EditProfileScreen>
    </View>
  );
}
