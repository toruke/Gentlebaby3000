import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Imports Logic & UI
import { DateSelector, GenderSelector, ValidatedInput } from '../../components/child/childForm';
import { useCreateChildForm } from '../../hooks/useCreateChild';

export default function CreateChildProfileScreen() {
  // On récupère tout depuis notre hook personnalisé
  const {
    formValues,
    setFirstName,
    setLastName,
    setBirthDate,
    setSelectedGender,
    loading,
    touched,
    isFormValid,
    validations,
    handleBlur,
    submitForm,
  } = useCreateChildForm();

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Création du profil Enfant</Text>
        <Text style={styles.subtitle}>Ajoutez les informations de votre enfant</Text>
      </View>

      {/* FORMULAIRE */}
      <View style={styles.formContainer}>
        
        <ValidatedInput
          label="Prénom *"
          placeholder="Prénom"
          value={formValues.firstName}
          onChangeText={setFirstName}
          onBlur={() => handleBlur('firstName')}
          isValid={validations.isFirstNameValid}
          isTouched={touched.firstName}
          errorMessage="Le prénom est requis (lettres uniquement)."
        />

        <ValidatedInput
          label="Nom *"
          placeholder="Nom"
          value={formValues.lastName}
          onChangeText={setLastName}
          onBlur={() => handleBlur('lastName')}
          isValid={validations.isLastNameValid}
          isTouched={touched.lastName}
          errorMessage="Le nom est requis (lettres uniquement)."
        />

        <DateSelector
          date={formValues.birthDate}
          onDateChange={(date) => {
            setBirthDate(date);
            handleBlur('birthDate');
          }}
          isValid={validations.isBirthDateValid}
          isTouched={touched.birthDate}
        />

        <GenderSelector
          selectedGender={formValues.selectedGender}
          onSelect={(gender) => {
            setSelectedGender(gender);
            handleBlur('gender');
          }}
          isValid={validations.isGenderValid}
          isTouched={touched.gender}
        />

        {/* BOUTON D'ACTION */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!isFormValid || loading) && styles.createButtonDisabled,
          ]}
          onPress={submitForm}
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

// Les styles restants sont uniquement ceux de structure de la page
// Les styles des inputs sont déplacés dans les composants
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