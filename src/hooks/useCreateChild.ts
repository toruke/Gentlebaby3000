import { useLocalSearchParams, useRouter } from 'expo-router'; // 🔹 Pour récupérer l'ID famille
import { useState } from 'react';
import { Alert } from 'react-native';
import { CreateChildRequest } from '../models/child';
import { isChildAgeValid, validateName } from '../utils/validators';
import { useChild } from './useChild';

export const useCreateChildForm = () => {
  // Récupération de l'ID de la famille depuis l'URL (ex: /family/123/add-child)
  const params = useLocalSearchParams();
  // Si le dossier s'appelle [id], alors familyId se trouve dans params.id
  const familyId = params.id;

  const router = useRouter();

  const { createChild, loading } = useChild();

  // --- États du formulaire (identique à avant) ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    birthDate: false,
    gender: false,
  });

  // --- Validation (identique à avant) ---
  const isFirstNameValid = validateName(firstName);
  const isLastNameValid = validateName(lastName);
  const isBirthDateValid = isChildAgeValid(birthDate);
  const isGenderValid = !!selectedGender;
  const isFormValid = isFirstNameValid && isLastNameValid && isBirthDateValid && isGenderValid;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // --- Soumission ---
  const submitForm = async () => {
    setTouched({ firstName: true, lastName: true, birthDate: true, gender: true });

    if (!isFormValid) return;

    // Vérification de sécurité
    if (!familyId || typeof familyId !== 'string') {
      Alert.alert('Erreur', 'Impossible de retrouver la famille associée.');
      return;
    }

    try {
      const childData: CreateChildRequest = {
        firstName,
        lastName,
        gender: selectedGender!,
        birthday: birthDate,
      };

      // 🔹 Appel du hook qui appelle le service avec familyId
      await createChild(familyId, childData);

      Alert.alert(
        'Félicitations ! 👶',
        'Le profil a été créé avec succès.',
        [
          { text: 'OK', onPress: () => router.back() }, // Retour au dashboard
        ],
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.';
      Alert.alert('Erreur', errorMessage);
    }
  };

  return {
    formValues: { firstName, lastName, birthDate, selectedGender },
    setFirstName,
    setLastName,
    setBirthDate,
    setSelectedGender,
    loading,
    touched,
    isFormValid,
    validations: { isFirstNameValid, isLastNameValid, isBirthDateValid, isGenderValid },
    handleBlur,
    submitForm,
  };
};