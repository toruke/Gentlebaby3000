import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />
      <Stack.Screen
        name="tutorRegistration"
        options={{ title: 'family' }}
      />
    </Stack>
  );
}
