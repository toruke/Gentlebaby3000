import { useState } from 'react';
// 1. On importe le bon nom de fonction depuis votre service
import { addChildProfile } from '@/src/services/childService'; 
import { CreateChildRequest } from '../models/child';

export const useChild = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChild = async (familyId: string, childData: CreateChildRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      // 2. On transforme les données pour qu'elles correspondent à ce que veut addChildProfile
      // Le formulaire envoie "birthday", le service veut "birthDate"
      const serviceData = {
        firstName: childData.firstName,
        lastName: childData.lastName,
        gender: childData.gender,
        birthDate: childData.birthday, // ⚠️ Mapping important ici
        photoUri: undefined, // Vous pourrez ajouter la photo plus tard si le formulaire le permet
        device: null,
      };

      // 3. On appelle la bonne fonction
      const childId = await addChildProfile(familyId, serviceData);
      
      return childId;

    } catch (err) {
      console.error('Erreur hook createChild:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createChild,
    loading,
    error,
  };
};