import { useState } from 'react';
import { CreateChildRequest } from '../models/child';
import { ChildService } from '../services/firebase/childService';

export const useChild = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChild = async (childData: CreateChildRequest) => {
    setLoading(true);
    setError(null);
    try {
      const childId = await ChildService.createChild(childData);
      setLoading(false);
      return childId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    createChild,
  };
};