import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import BackgroundShapes from '../src/components/backgroundShapes';
import { useAuthRedirect } from '../src/hooks/useAuthRedirect';
import '../global.css';

export default function RootLayout() {
  // Utilise le hook de redirection dans le layout racine
  useAuthRedirect();

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
            name="auth/profile/index" 
            options={{ 
              title: 'Mon profil',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }} 
          />
          
          <Stack.Screen 
            name="family/tutor-registration/index" 
            options={{ 
              title: 'Créer une famille',
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