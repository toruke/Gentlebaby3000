import { Link } from 'expo-router';
import { View } from 'react-native';
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
      <Button title="caca" onPress={() => { }} />
      <Link href="/family/FamilyManagement">Gestion des rôles et des appareils</Link>
    </View>
  );
}
