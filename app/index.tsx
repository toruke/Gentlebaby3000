import { Link, router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
//import Button from '../src/components/Button';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur GentleBaby3000</Text>
      <Button title="Créer un compte" onPress={() => router.push('/signup')} />
      <Link href="/user/EditingProfileUser">Modification de mon profil utilisateur</Link>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});