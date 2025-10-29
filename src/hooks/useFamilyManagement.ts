import { useEffect, useState } from 'react';
import { getFamilySelectedService, getFamilyService } from '../services/familyEditService';
import { FamilyMember } from '../components/FamilyMember';

export const useFamilyManagement = () => {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [families, setFamilies] = useState<{ id: string; name?: string }[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect (() => {
    const fetchFamily = async() =>{
      try{
        setLoading(true);
        const familiesQuery = await getFamilyService();
        if (familiesQuery.length === 0 ){
          setError('Aucun membre trouvé');
          return;
        }
        if (familiesQuery.length === 1){
          const  familyQuery = await getFamilySelectedService(familiesQuery[0].id);
          setFamily(familyQuery);
          setSelectedFamily(familiesQuery[0].id);
        }
        else {
          setFamilies(familiesQuery);
        }
      }
      catch(error){
        // eslint-disable-next-line no-console
        console.error('Erreur Firebase: ' , error);
        setError('Erreur lors de la récupération des membres de la famille');
      }
      finally {
        setLoading(false);
      }
    };
    fetchFamily();
  },[]);

  const selectFamily = async(familyId : string) => {
    try{
      setLoading(true);
      const familyMembers = await getFamilySelectedService(familyId);
      setFamily(familyMembers);
      setSelectedFamily(familyId);
    }
    catch(error){
      // eslint-disable-next-line no-console
      console.error('Impossible de charger cette famille', error);
      setError('Impossible de charger cette famille');      }
    finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
    case 'connected': return '#48bb78';
    case 'disconnected': return '#e53e3e';
    default: return '#a0aec0';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case 'connected': return 'Connecté';
    case 'disconnected': return 'Déconnecté';
    default: return 'Inconnu';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
    case 'Tuteur': return '#6b46c1';
    case 'Enfant': return '#4299e1';
    case 'Membre': return '#38a169';
    default: return '#718096';
    }
  };

  const getUpperName = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return { families, selectedFamily, family, loading, error, selectFamily, getStatusColor, getStatusText, getRoleColor, getUpperName };
};