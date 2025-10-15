export const useFamilyManagement = () => {

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
  return { getStatusColor, getStatusText, getRoleColor };
};