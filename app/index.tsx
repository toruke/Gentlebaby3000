import { View } from 'react-native';
import { Link } from 'expo-router';
import Button from '../components/Button';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Link href="/tutorRegistration">Inscription tuteur</Link>
      <Button title="caca" onPress={() => {}} />
    </View>
  );
}
