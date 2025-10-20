import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      {/* Ici tu donnes un titre propre pour tes pages */}
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />

      <Stack.Screen name="(screens)/signup" options={{ title: 'Inscription' }} />
      <Stack.Screen name="(screens)/profils" options={{ title: 'Mon profil' }} />
      <Stack.Screen name="/user/EditingProfileUser" options={{ title: 'Modification de mon profil utilisateur' }} />
    </Stack>
  );
}

