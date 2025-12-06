export const getStatusColor = (status: string) => {
  switch (status) {
  case 'connected': return '#48bb78';
  case 'disconnected': return '#e53e3e';
  default: return '#a0aec0';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
  case 'connected': return 'Connecté';
  case 'disconnected': return 'Déconnecté';
  default: return 'Inconnu';
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
  case 'Tuteur': return '#6b46c1';
  case 'Enfant': return '#4299e1';
  case 'Membre': return '#38a169';
  default: return '#718096';
  }
};

export const getUpperName = (str: string) => {
  if (str.length === 0) return '';
  if (/[0-9]/.test(str.charAt(0))) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
