import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- TYPE DEFINITIONS ---

interface ValidatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  isValid: boolean;
  isTouched: boolean;
  errorMessage: string;
}

interface GenderSelectorProps {
  selectedGender?: 'male' | 'female' | 'other';
  onSelect: (gender: 'male' | 'female' | 'other') => void;
  isValid: boolean;
  isTouched: boolean;
}

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  isValid: boolean;
  isTouched: boolean;
}

// --- COMPONENTS ---

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label, value, onChangeText, onBlur, placeholder, isValid, isTouched, errorMessage,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        isTouched && !isValid && styles.inputError,
        isTouched && isValid && value.length > 0 && styles.inputValid,
      ]}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      autoCapitalize="words"
    />
    {isTouched && !isValid && <Text style={styles.errorText}>{errorMessage}</Text>}
    {isTouched && isValid && value.length > 0 && <Text style={styles.validText}>✓ Valide</Text>}
  </View>
);

export const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, onSelect, isValid, isTouched }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>Genre *</Text>
    <View style={styles.genderContainer}>
      {(['male', 'female', 'other'] as const).map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[
            styles.genderButton,
            selectedGender === gender && styles.genderSelected,
            isTouched && !isValid && styles.genderButtonError,
          ]}
          onPress={() => onSelect(gender)}
        >
          <Text style={[
            styles.genderText,
            selectedGender === gender && styles.genderTextSelected,
          ]}>
            {gender === 'male' ? 'Garçon' : gender === 'female' ? 'Fille' : 'Autre'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {isTouched && !isValid && <Text style={styles.errorText}>Veuillez sélectionner un genre.</Text>}
  </View>
);

export const DateSelector: React.FC<DateSelectorProps> = ({ date, onDateChange, isValid, isTouched }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) onDateChange(selectedDate);
  };

  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Date de naissance *</Text>
      <TouchableOpacity
        style={[
          styles.dateInput,
          isTouched && !isValid && styles.inputError,
          isTouched && isValid && styles.inputValid,
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.dateText, styles.dateTextSelected]}>{formatDate(date)}</Text>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
      
      {isTouched && !isValid && <Text style={styles.errorText}>L'enfant doit avoir entre 0 et 18 ans.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#2d3748', marginBottom: 8 },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#2d3748',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  dateInput: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  inputError: { borderColor: '#e53e3e', backgroundColor: '#fed7d7' },
  inputValid: { borderColor: '#38a169', backgroundColor: '#f0fff4' },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: 4, marginLeft: 4 },
  validText: { color: '#38a169', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },
  dateText: { fontSize: 16, color: '#999' },
  dateTextSelected: { color: '#2d3748' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  genderButton: {
    flex: 1, backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginHorizontal: 4, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  genderButtonError: { borderColor: '#e53e3e', backgroundColor: '#fed7d7' },
  genderSelected: { backgroundColor: '#6b46c1', borderColor: '#6b46c1' },
  genderText: { fontSize: 14, fontWeight: '500', color: '#4a5568' },
  genderTextSelected: { color: '#ffffff' },
});