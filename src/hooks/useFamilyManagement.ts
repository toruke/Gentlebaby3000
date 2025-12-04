import { useCallback, useState } from 'react';
import { getFamilySelectedService } from '../services/FamilyMangement';
import { FamilyMember } from '../components/FamilyMember';
import { useFocusEffect } from '@react-navigation/native';

export const useFamilyManagement = (id: string | undefined) => {
  const [family, setFamily] = useState<FamilyMember[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const selectFamily = useCallback(async(familyId : string | undefined) => {
    if (!familyId) {
      //setError('Aucune famille sélectionnée');
      return;
    };

    try{
      setLoading(true);
      const familyMembers = await getFamilySelectedService(familyId);
      setFamily(familyMembers);
      setError('');
    }
    catch(error){
      console.error('Impossible de charger cette famille', error);
      setError('Impossible de charger cette famille');      }
    finally {
      setLoading(false);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      if (id){
        selectFamily(id);
        setError('');
      }
      else {
        setError('Attente ID de la famille...');
      }


    }, [selectFamily, id]),
  );



  return { family, loading, error, selectFamily };
};