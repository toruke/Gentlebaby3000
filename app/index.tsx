import { View} from 'react-native';
import {Link} from 'expo-router';
import Button from '../src/components/Button';

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button title="caca" onPress={() => {}} />
      <Link href="/roleApparelManager">Gestion des rôles et des appareils</Link>
    </View>
  );
}
