import { useState } from 'react';
import { addChildToFamily } from '../services/childService';
import { CreateChildRequest } from '../models/child';

export const useChild = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChild = async (familyId: string, childData: CreateChildRequest) => {
    setLoading(true);
    setError(null);
    try {
      const childId = await addChildToFamily(familyId, childData);
      return childId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'enfant';
      setError(message);
      throw err; // On renvoie l'erreur pour que le formulaire puisse afficher une alerte
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