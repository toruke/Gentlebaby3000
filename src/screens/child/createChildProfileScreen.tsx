import { useRouter } from 'expo-router';
import React from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
} from 'react-native';

// Imports Logic & UI
import { DateSelector, GenderSelector, ValidatedInput } from '../../components/child/childForm';
import { useCreateChildForm } from '../../hooks/useCreateChild';

export default function CreateChildProfileScreen() {
  const router = useRouter();
  
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
    // 1. Clavier qui ne cache pas la vue + Fond transparent assombri
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.overlayContainer}
    >
      {/* 2. Zone cliquable pour fermer (le vide) */}
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* 3. La modale (Pop-up) */}
      <View style={styles.modalContent}>
        
        {/* En-tête de la modale */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Nouveau Profil</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Ajoutez les informations de l'enfant</Text>

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
              testID="create-child-button"
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

            <TouchableOpacity onPress={() => router.back()} style={styles.cancelLink}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Fond complet de l'écran (transparent et sombre)
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Effet d'assombrissement
    padding: 20,
  },
  // La couche invisible derrière qui capture le clic pour fermer
  backdrop: {
    ...StyleSheet.absoluteFillObject, 
    zIndex: 0, 
  },
  // La carte blanche (Pop-up)
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%', // Pour ne pas dépasser l'écran
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1, // Au-dessus du backdrop
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b46c1',
  },
  closeIcon: {
    fontSize: 24,
    color: '#a0aec0',
    padding: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  formContainer: {
    // Plus besoin de margin négative car on est dans une modale propre
  },
  createButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  createButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    color: '#718096',
    fontSize: 14,
  },
});