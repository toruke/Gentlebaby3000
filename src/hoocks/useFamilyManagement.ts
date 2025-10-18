import { useEffect, useState } from 'react';
import { getFamilyService } from '../services/FamilyService';
import { FamilyMember } from '../components/FamilyMember';

export const useFamilyManagement = () => {
  const [family, setFamily] = useState<FamilyMember[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect (() => {
    const fetchFamily = async() =>{
      try{
        setLoading(true);
        const  familyQuery = await getFamilyService();
        if (familyQuery.length === 0 ){
          setError('Aucun membre trouvé');
        }
        setFamily(familyQuery);
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
  return { family,loading, error, getStatusColor, getStatusText, getRoleColor };
};