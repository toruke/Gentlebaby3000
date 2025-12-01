import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';


import BackgroundShapes from '../components/backgroundShapes';

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>

      {/* Fond vectoriel pastel */}  
      <BackgroundShapes style={StyleSheet.absoluteFill} />
      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Logo/Image centrale */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>👶</Text>
          </View>
          <Text style={styles.title}>GentleBaby</Text>
          <Text style={styles.subtitle}>Votre babyphone connecté</Text>
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Connexion</Text>
        </TouchableOpacity>

        {/* Lien vers inscription */}
        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.signupText}>
            Pas de compte ? <Text style={styles.signupHighlight}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  shape1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD6E0', // Rose pastel
    opacity: 0.6,
  },
  shape2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C8E6FF', // Bleu pastel
    opacity: 0.5,
  },
  shape3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4F0FF', // Bleu clair pastel
    opacity: 0.4,
    right: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupLink: {
    padding: 10,
  },
  signupText: {
    color: '#64748b',
    fontSize: 14,
  },
  signupHighlight: {
    color: '#007bff',
    fontWeight: '600',
  },
});