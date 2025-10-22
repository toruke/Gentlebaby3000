import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import Button from '../src/components/Button';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur GentleBaby3000</Text>
      <Button title="Créer un compte" onPress={() => router.push('./auth/signup')} />

      <Link href="./family/tabs/dashboard" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Accéder à mon espace famille</Text>
        </TouchableOpacity>
      </Link>
    </View>

  );
}



const styles = StyleSheet.create({
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});

