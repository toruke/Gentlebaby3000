// src/components/task/MemberSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Tutor } from '../../models/task'; // Ajuste le chemin

interface Props {
  members: Tutor[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  error?: string;
}

export const MemberSelector = ({ members, selectedIds, onToggle, loading, error }: Props) => {
  if (loading) {
    return <ActivityIndicator color="#8E59FF" />;
  }
  
  if (members.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Aucun membre trouvé.</Text>
        <Text style={styles.emptySubtext}>Vérifiez votre base de données.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        {members.map(tutor => (
          <TouchableOpacity
            key={tutor.id}
            style={[
              styles.chip,
              selectedIds.includes(tutor.id) && styles.chipSelected,
            ]}
            onPress={() => onToggle(tutor.id)}
          >
            <Text style={[
              styles.text, 
              selectedIds.includes(tutor.id) && styles.textSelected,
            ]}>
              {tutor.firstname} {tutor.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  chipSelected: { backgroundColor: '#e3f2fd', borderColor: '#2196f3' },
  text: { fontSize: 14, color: '#666', fontWeight: '600' },
  textSelected: { color: '#2196f3' },
  emptyBox: { padding: 15, backgroundColor: '#f8d7da', borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  emptyText: { color: '#721c24', fontWeight: 'bold' },
  emptySubtext: { color: '#721c24', fontSize: 12 },
  error: { color: '#dc3545', fontSize: 12, marginTop: -5, marginBottom: 10, marginLeft: 5 },
});