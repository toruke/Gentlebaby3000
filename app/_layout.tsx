import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />

      
      <Stack.Screen name="auth/signup/index" options={{ title: 'Inscription' }} />
      <Stack.Screen name="auth/profile/index" options={{ title: 'Mon profil' }} />
      <Stack.Screen name="family/tutor-registration/index" options={{ title: 'Créer une famille' }} />
      <Stack.Screen name="family/family-welcome/index" options={{ title: 'Bienvenue' }} />
      <Stack.Screen name="family/FamilyManagement" options={{ title: 'Gestion famille' }} />
      <Stack.Screen name="family/ModifyRole" options={{ title: 'Modification du rôle' }} />

    </Stack>
  );
}