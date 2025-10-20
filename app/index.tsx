import { router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { EditProfileScreen } from './screens/EditProfileScreen';
//import Button from '../src/components/Button';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur GentleBaby3000</Text>
      <Button title="Créer un compte" onPress={() => router.push('/signup')} />
      <EditProfileScreen></EditProfileScreen>

    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
