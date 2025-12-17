// src/screens/task/createTaskScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

// Imports personnalisés
import { MemberSelector } from '../../components/task/memberSelector';
import { useCreateTask } from '../../hooks/useCreateTask';


export default function CreateTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const familyId = Array.isArray(id) ? id[0] : id;

  // On récupère toute la logique depuis le hook
  const {
    taskName, taskIcon, responsibleMembers, taskType, interval, startDateTime, fixedTimes, comments, evaluation,
    availableTutors, loading, isSubmitting, errors, showDatePicker,
    setTaskName, setTaskIcon, setTaskType, setInterval, setFixedTimes, setComments, setEvaluation, setShowDatePicker,
    handleTextChange, toggleMember, onDateChange, submit,
  } = useCreateTask(familyId);

  const availableIcons = [
    { icon: '🍼', label: 'Biberon' }, { icon: '🛏️', label: 'Coucher' },
    { icon: '🚽', label: 'Selles' }, { icon: '🍽️', label: 'Repas' },
    { icon: '🛁', label: 'Bain' }, { icon: '💊', label: 'Médicament' },
    { icon: '🎮', label: 'Jeu' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, marginRight: 10 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Créer une nouvelle tâche</Text>
      </View>

      {/* 1. NOM */}
      <TextInput
        style={[styles.input, errors.taskName && styles.inputError]}
        placeholder="Nom de la tâche"
        value={taskName}
        onChangeText={handleTextChange(setTaskName, 'taskName')}
      />
      {errors.taskName && <Text style={styles.errorText}>{errors.taskName}</Text>}

      {/* 2. ICONES */}
      <Text style={styles.label}>Icône :</Text>
      <View style={styles.iconContainer}>
        {availableIcons.map(item => (
          <TouchableOpacity
            key={item.icon}
            style={[styles.iconButton, taskIcon === item.icon && styles.iconButtonSelected]}
            onPress={() => setTaskIcon(item.icon)}
          >
            <Text style={styles.iconEmoji}>{item.icon}</Text>
            <Text style={styles.iconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. MEMBRES (Composant séparé) */}
      <Text style={styles.label}>Tuteurs responsables :</Text>
      <MemberSelector
        members={availableTutors}
        selectedIds={responsibleMembers}
        onToggle={toggleMember}
        loading={loading}
        error={errors.members}
      />

      {/* 4. TYPE DE TÂCHE */}
      <View style={styles.taskTypeContainer}>
        <Text style={styles.label}>Type de tâche :</Text>
        <View style={styles.radioGroup}>
          {[
            { id: 'recurring' as const, label: 'Occurrente' },
            { id: 'temporal' as const, label: 'Temporel' },
            { id: 'event' as const, label: 'Événement' },
          ].map((type) => (
            <TouchableOpacity key={type.id} onPress={() => setTaskType(type.id)}>
              <Text style={taskType === type.id ? styles.selectedRadio : styles.radio}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. LOGIQUE CONDITIONNELLE */}
      {taskType === 'recurring' && (
        <View>
          <TextInput
            style={[styles.input, errors.interval && styles.inputError]}
            placeholder="Intervalle (heures)"
            value={interval}
            onChangeText={handleTextChange(setInterval, 'interval')}
            keyboardType="numeric"
          />
          {errors.interval && <Text style={styles.errorText}>{errors.interval}</Text>}

          <Text style={styles.label}>Début de la tâche :</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{startDateTime.toLocaleString('fr-FR')}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={startDateTime}
              mode="datetime"
              display="default"
              onChange={onDateChange}
              {...(Platform.OS === 'android' ? { is24Hour: true } : {})}
            />
          )}
        </View>
      )}

      {taskType === 'temporal' && (
        <View>
          <TextInput
            style={[styles.input, errors.fixedTimes && styles.inputError]}
            placeholder="Heures fixes (ex: 13:00, 19:00)"
            value={fixedTimes}
            onChangeText={handleTextChange(setFixedTimes, 'fixedTimes')}
          />
          {errors.fixedTimes && <Text style={styles.errorText}>{errors.fixedTimes}</Text>}
          <Text style={styles.helpText}>Séparez les heures par des virgules (format 24h)</Text>
        </View>
      )}

      {taskType === 'event' && (
        <View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Commentaires"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Évaluation :</Text>
          <View style={styles.evaluationContainer}>
            {[0, 1, 2, 3, 4, 5].map(value => (
              <TouchableOpacity
                key={value}
                style={[styles.evaluationButton, evaluation === value && styles.evaluationButtonSelected]}
                onPress={() => setEvaluation(value)}
              >
                <Text style={[styles.evaluationText, evaluation === value && styles.evaluationTextSelected]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>0 = Aucun problème • 5 = Grave</Text>
        </View>
      )}

      {/* SUBMIT BUTTON */}
      <TouchableOpacity
        style={[styles.createButton, isSubmitting && { opacity: 0.7 }]}
        onPress={submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Créer la tâche</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 10, borderRadius: 8, fontSize: 16 },
  inputError: { borderColor: '#dc3545' },
  textArea: { height: 100, textAlignVertical: 'top' },

  iconContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  iconButton: { alignItems: 'center', padding: 10, margin: 5, borderRadius: 8, borderWidth: 2, borderColor: '#e0e0e0', backgroundColor: '#f8f8f8', width: '28%' },
  iconButtonSelected: { borderColor: '#007bff', backgroundColor: '#e3f2fd' },
  iconEmoji: { fontSize: 30, marginBottom: 4 },
  iconLabel: { fontSize: 11, color: '#666' },

  taskTypeContainer: { marginBottom: 15, marginTop: 10 },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  radio: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, fontSize: 14 },
  selectedRadio: { padding: 12, backgroundColor: '#007bff', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: '600' },

  dateButton: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  dateButtonText: { fontSize: 16, color: '#333' },

  evaluationContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  evaluationButton: { flex: 1, padding: 12, marginHorizontal: 3, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#f0f0f0' },
  evaluationButtonSelected: { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
  evaluationText: { fontSize: 16, fontWeight: '600', color: '#666' },
  evaluationTextSelected: { color: '#856404' },

  errorText: { color: '#dc3545', fontSize: 12, marginTop: -8, marginBottom: 10, marginLeft: 5 },
  helpText: { fontSize: 12, color: '#6c757d', marginTop: -5, marginBottom: 10, fontStyle: 'italic' },

  createButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});