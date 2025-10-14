import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { FamilySettings } from '../../src/models/family';
import { getMockFamilyData } from '../../src/services/mockData';

export default function FamilySettingsScreen() {
  const familyData = getMockFamilyData();
  const [settings, setSettings] = useState<FamilySettings>(familyData.settings);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Ici, intégrer l'appel API pour sauvegarder
    Alert.alert('Succès', 'Paramètres sauvegardés');
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Famille</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Nom de la famille</Text>
          <TextInput
            style={styles.input}
            value={settings.familyName}
            onChangeText={(text) => setSettings({ ...settings, familyName: text })}
            editable={isEditing}
            placeholder="Nom de famille"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>Alertes tâches</Text>
          <Switch
            value={settings.notifications.tasks}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, tasks: value },
            })}
            disabled={!isEditing}
          />
        </View>

        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>Alertes tours de garde</Text>
          <Switch
            value={settings.notifications.shifts}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, shifts: value },
            })}
            disabled={!isEditing}
          />
        </View>

        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>Alertes santé</Text>
          <Switch
            value={settings.notifications.health}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, health: value },
            })}
            disabled={!isEditing}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Modifier les paramètres</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2d3748',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  switchLabel: {
    fontSize: 16,
    color: '#4a5568',
  },
  actions: {
    marginTop: 24,
  },
  editButton: {
    backgroundColor: '#6b46c1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});