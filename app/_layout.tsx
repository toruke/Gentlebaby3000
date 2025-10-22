import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />
      {/* SIMPLIFIER les noms */}
      <Stack.Screen name="auth/signup" options={{ title: 'Inscription' }} />
      <Stack.Screen name="auth/profile" options={{ title: 'Mon profil' }} />
    </Stack>
  );
}