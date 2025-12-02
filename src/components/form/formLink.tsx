import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FormLinkProps {
  text: string;
  highlightText: string;
  onPress: () => void;
}

export default function FormLink({ text, highlightText, onPress }: FormLinkProps) {
  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <Text style={styles.text}>
        {text} <Text style={styles.highlight}>{highlightText}</Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  text: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  highlight: {
    color: '#007bff',
    fontWeight: '600',
  },
});