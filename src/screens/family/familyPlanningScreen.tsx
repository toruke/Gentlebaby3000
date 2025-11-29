import { View, Text, StyleSheet } from 'react-native';

export default function PlanningScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planning des Activités</Text>
      <Text style={styles.message}>Bientôt disponible</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#718096',
  },
});