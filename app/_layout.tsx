import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import '../global.css';
import BackgroundShapes from '../src/components/backgroundShapes';
import LoadingScreen from '../src/components/loadingScreen';
import { useAuthRedirect } from '../src/hooks/useAuthRedirect';

export default function RootLayout() {
  const { isLoading } = useAuthRedirect();

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <BackgroundShapes style={styles.background} />

      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Bienvenue',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="auth/login/index"
            options={{
              title: 'Connexion',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />

          <Stack.Screen
            name="auth/signup/index"
            options={{
              title: 'Inscription',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />
          <Stack.Screen
            name="user/EditingProfileUser"
            options={{
              title: 'Modification de mon profil utilisateur',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />
          <Stack.Screen
            name="family/ModifyRole"
            options={{
              title: 'Modification du rôle',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  stackContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});