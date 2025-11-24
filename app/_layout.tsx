import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

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
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});