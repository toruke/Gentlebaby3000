import { StyleSheet, Text, View } from 'react-native';

export default function ManagementScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appareils et Utilisateurs</Text>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 30,
  },
  logoutBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#8E59FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#8E59FF',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  logoutText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
