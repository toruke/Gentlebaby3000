import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
<<<<<<< feature/US-117

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerTitleAlign: 'center' }}>
          {/* Page de bienvenue */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          
          {/* Routes d'authentification */}
          <Stack.Screen 
            name="auth/signup/index" 
            options={{ 
              title: 'Inscription',
              headerBackTitle: 'Retour',
            }} 
          />
          <Stack.Screen 
            name="auth/profile/index" 
            options={{ 
              title: 'Mon profil', 
              headerBackTitle: 'Retour',
            }} 
          />
          
          {/* Route famille */}
          <Stack.Screen 
            name="family" 
            options={{ headerShown: false }} 
=======
import BackgroundShapes from '../src/components/backgroundShapes';
import { useAuthRedirect } from '../src/hooks/useAuthRedirect';
import LoadingScreen from '../src/components/loadingScreen';
import '../global.css';

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
            name="(tabs)" 
            options={{ 
              headerShown: false, 
            }} 
>>>>>>> dev
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
<<<<<<< feature/US-117
  content: {
=======
  stackContainer: {
>>>>>>> dev
    flex: 1,
    backgroundColor: 'transparent',
  },
});