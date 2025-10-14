import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { testFirebaseConnection } from '../src/utils/testFirebase';


export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GentleBaby3000</Text>
        <Text style={styles.subtitle}>Votre application de suivi bébé</Text>

      </View>

      <View>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testFirebaseConnection}
        >
          <Text style={styles.testButtonText}>Test Firebase</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>

        <Link href="./child/createChild" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>👶 Créer un profil enfant</Text>
            <Text style={styles.menuDescription}>
              Ajouter un nouveau profil enfant à votre compte
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Vous pouvez ajouter d'autres boutons ici */}
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>📊 Tableau de bord</Text>
          <Text style={styles.menuDescription}>
            Voir les statistiques et activités
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⚙️ Paramètres</Text>
          <Text style={styles.menuDescription}>
            Gérer vos préférences
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6b46c1',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    opacity: 0.9,
  },
  menu: {
    padding: 24,
    marginTop: -20,
  },
  menuButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#718096',
  },
  testButton: {
    backgroundColor: '#b63838ff', // Rouge vif
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  testButtonText: { // 👈 AJOUTEZ CE STYLE
    color: '#ffffff', // Blanc pour être visible sur fond rouge
    fontWeight: 'bold',
    fontSize: 16,
  },
});