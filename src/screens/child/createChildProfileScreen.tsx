import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
} from 'react-native';
import { Link } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Import des nouvelles fonctions organisées
// Update the path below if your useChild hook is located elsewhere
import { useChild } from '../../hooks/useChild';
import { CreateChildRequest } from '../../models/child';
import { validateName, isChildAgeValid } from '../../utils/validators';

// Dans votre composant, ajoutez :

export default function ChildProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>();

  const { createChild, loading } = useChild();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    setSelectedGender(gender);
  };

  const handleSubmit = async () => {
    // Validation finale avant soumission
    if (!validateName(firstName)) {
      Alert.alert('Erreur', 'Le prénom n\'est pas valide. Utilisez seulement des lettres (2-20 caractères).');
      return;
    }

    if (!validateName(lastName)) {
      Alert.alert('Erreur', 'Le nom n\'est pas valide. Utilisez seulement des lettres (2-20 caractères).');
      return;
    }

    if (!selectedGender) {
      Alert.alert('Erreur', 'Veuillez sélectionner un genre.');
      return;
    }

    if (!isChildAgeValid(birthDate)) {
      Alert.alert('Erreur', 'La date de naissance n\'est pas valide. L\'enfant doit avoir entre 0 et 18 ans.');
      return;
    }

    try {
      const childData: CreateChildRequest = {
        firstName,
        lastName,
        gender: selectedGender,
        birthday: birthDate,
      };

      await createChild(childData);
      Alert.alert('Succès', 'Profil de l\'enfant créé avec succès !');
            
      // Réinitialiser le formulaire
      setFirstName('');
      setLastName('');
      setBirthDate(new Date());
      setSelectedGender(undefined);
            
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message)
        : 'Une erreur est survenue lors de la création du profil.';
      Alert.alert(errorMessage, 'Une erreur est survenue lors de la création du profil.');
    }
  };

  // Le reste de votre code JSX reste identique...
  return (
    <ScrollView style={styles.container}>
      {/* Votre JSX actuel reste le même */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Création du profile Enfant</Text>
        <Text style={styles.subtitle}>Ajoutez les informations de votre enfant</Text>
      </View>

      <View style={styles.formContainer}>
        
        {/* Champ Prénom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Prénom"
            autoCapitalize="words"
          />
        </View>

        {/* Champ Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nom"
            autoCapitalize="words"
          />
        </View>

        {/* Champ Date de naissance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date de naissance</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={showDatePickerModal}
          >
            <Text style={[
              styles.dateText,
              birthDate ? styles.dateTextSelected : null,
            ]}>
              {formatDate(birthDate)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Champ Genre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'male' && styles.genderSelected,
              ]}
              onPress={() => handleGenderSelect('male')}
            >
              <Text style={[
                styles.genderText,
                selectedGender === 'male' && styles.genderTextSelected,
              ]}>Garçon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'female' && styles.genderSelected,
              ]}
              onPress={() => handleGenderSelect('female')}
            >
              <Text style={[
                styles.genderText,
                selectedGender === 'female' && styles.genderTextSelected,
              ]}>Fille</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'other' && styles.genderSelected,
              ]}
              onPress={() => handleGenderSelect('other')}
            >
              <Text style={[
                styles.genderText,
                selectedGender === 'other' && styles.genderTextSelected,
              ]}>Autre</Text>
            </TouchableOpacity>
          </View>
        </View>
                
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Création...' : 'Créer le profil'}
          </Text>
        </TouchableOpacity>

        <Link href="/" style={styles.cancelLink}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Link>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    opacity: 0.9,
  },
  formContainer: {
    padding: 24,
    marginTop: -20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: '#e53e3e',
    backgroundColor: '#fed7d7',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#999',
  },
  dateTextSelected: {
    color: '#2d3748',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  genderSelected: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  genderTextSelected: {
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#6b46c1',
    fontSize: 16,
    fontWeight: '500',
  },
});