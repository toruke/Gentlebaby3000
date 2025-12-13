import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WelcomeHeaderProps {
  userName: string;
  familyName: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  userName, 
  familyName, 
}) => (
  <View style={styles.container}>
    <Text style={styles.greeting}>
      Bonjour {userName} {familyName}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
});