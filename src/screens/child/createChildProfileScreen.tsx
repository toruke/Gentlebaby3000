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
import { useChild } from '../../hooks/useChild';
import { CreateChildRequest } from '../../models/child';
import { validateName, isChildAgeValid } from '../../utils/validators';

export default function ChildProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>();

  // États pour le tracking des champs touchés
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [birthDateTouched, setBirthDateTouched] = useState(false);
  const [genderTouched, setGenderTouched] = useState(false);

  const { createChild, loading } = useChild();

  // Fonctions de validation
  const isFirstNameValid = validateName(firstName);
  const isLastNameValid = validateName(lastName);
  const isBirthDateValid = isChildAgeValid(birthDate);
  const isGenderValid = !!selectedGender;

  // Fonction pour déterminer si le formulaire est valide
  const isFormValid = isFirstNameValid && isLastNameValid && isBirthDateValid && isGenderValid;

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      setBirthDateTouched(true);
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
    setGenderTouched(true);
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
  };

  const handleFirstNameBlur = () => {
    setFirstNameTouched(true);
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
  };

  const handleLastNameBlur = () => {
    setLastNameTouched(true);
  };

  const handleSubmit = async () => {
    // Marquer tous les champs comme touchés pour afficher toutes les erreurs
    setFirstNameTouched(true);
    setLastNameTouched(true);
    setBirthDateTouched(true);
    setGenderTouched(true);

    if (!isFormValid) {
      return; // Ne rien faire si le formulaire n'est pas valide
    }

    try {
      const childData: CreateChildRequest = {
        firstName,
        lastName,
        gender: selectedGender!,
        birthday: birthDate,
      };

      await createChild(childData);
      Alert.alert('Succès', 'Profil de l\'enfant créé avec succès !');
            
      // Réinitialiser le formulaire
      setFirstName('');
      setLastName('');
      setBirthDate(new Date());
      setSelectedGender(undefined);
      setFirstNameTouched(false);
      setLastNameTouched(false);
      setBirthDateTouched(false);
      setGenderTouched(false);
            
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message)
        : 'Une erreur est survenue lors de la création du profil.';
      Alert.alert('Erreur', errorMessage);
    }
  };

  // Fonctions pour générer les messages d'erreur
  const getFirstNameError = () => {
    if (!firstNameTouched) return null;
    if (!firstName) return 'Le prénom est requis';
    if (!isFirstNameValid) return 'Le prénom n\'est pas valide. Utilisez seulement des lettres (2-20 caractères).';
    return null;
  };

  const getLastNameError = () => {
    if (!lastNameTouched) return null;
    if (!lastName) return 'Le nom est requis';
    if (!isLastNameValid) return 'Le nom n\'est pas valide. Utilisez seulement des lettres (2-20 caractères).';
    return null;
  };

  const getBirthDateError = () => {
    if (!birthDateTouched) return null;
    if (!isBirthDateValid) return 'L\'enfant doit avoir entre 0 et 18 ans.';
    return null;
  };

  const getGenderError = () => {
    if (!genderTouched) return null;
    if (!isGenderValid) return 'Veuillez sélectionner un genre.';
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Création du profile Enfant</Text>
        <Text style={styles.subtitle}>Ajoutez les informations de votre enfant</Text>
      </View>

      <View style={styles.formContainer}>
        
        {/* Champ Prénom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={[
              styles.input,
              firstNameTouched && !isFirstNameValid && styles.inputError,
              firstNameTouched && isFirstNameValid && firstName && styles.inputValid,
            ]}
            value={firstName}
            onChangeText={handleFirstNameChange}
            onBlur={handleFirstNameBlur}
            placeholder="Prénom"
            autoCapitalize="words"
          />
          {getFirstNameError() && (
            <Text style={styles.errorText}>{getFirstNameError()}</Text>
          )}
          {firstNameTouched && isFirstNameValid && firstName && (
            <Text style={styles.validText}>✓ Prénom valide</Text>
          )}
        </View>

        {/* Champ Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={[
              styles.input,
              lastNameTouched && !isLastNameValid && styles.inputError,
              lastNameTouched && isLastNameValid && lastName && styles.inputValid,
            ]}
            value={lastName}
            onChangeText={handleLastNameChange}
            onBlur={handleLastNameBlur}
            placeholder="Nom"
            autoCapitalize="words"
          />
          {getLastNameError() && (
            <Text style={styles.errorText}>{getLastNameError()}</Text>
          )}
          {lastNameTouched && isLastNameValid && lastName && (
            <Text style={styles.validText}>✓ Nom valide</Text>
          )}
        </View>

        {/* Champ Date de naissance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date de naissance *</Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              birthDateTouched && !isBirthDateValid && styles.inputError,
              birthDateTouched && isBirthDateValid && styles.inputValid,
            ]}
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
          {getBirthDateError() && (
            <Text style={styles.errorText}>{getBirthDateError()}</Text>
          )}
          {birthDateTouched && isBirthDateValid && (
            <Text style={styles.validText}>✓ Âge valide</Text>
          )}
        </View>

        {/* Champ Genre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre *</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'male' && styles.genderSelected,
                genderTouched && !isGenderValid && styles.genderButtonError,
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
                genderTouched && !isGenderValid && styles.genderButtonError,
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
                genderTouched && !isGenderValid && styles.genderButtonError,
              ]}
              onPress={() => handleGenderSelect('other')}
            >
              <Text style={[
                styles.genderText,
                selectedGender === 'other' && styles.genderTextSelected,
              ]}>Autre</Text>
            </TouchableOpacity>
          </View>
          {getGenderError() && (
            <Text style={styles.errorText}>{getGenderError()}</Text>
          )}
          {genderTouched && isGenderValid && (
            <Text style={styles.validText}>✓ Genre sélectionné</Text>
          )}
        </View>
                
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!isFormValid || loading) && styles.createButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
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
  inputValid: {
    borderColor: '#38a169',
    backgroundColor: '#f0fff4',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  validText: {
    color: '#38a169',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
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
  genderButtonError: {
    borderColor: '#e53e3e',
    backgroundColor: '#fed7d7',
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
  createButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowColor: '#a0aec0',
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