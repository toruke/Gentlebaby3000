import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ROInput({
  label,
  value,
  keyboardType,
}: {
    label: string;
    value: string;
    keyboardType?: 'email-address' | 'default';
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.inputMuted]}
        value={value}
        editable={false}
        selectTextOnFocus={false}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, color: '#111',
  },
  inputMuted: { backgroundColor: '#f0f0f0', color: '#777' },
});
