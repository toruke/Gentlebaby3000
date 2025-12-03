export const validateName = (name: string): boolean => {
  if (!name || name.length < 2) return false;
  if (name.length > 20) return false;
    
  // Regex: seulement lettres, espaces, apostrophes et tirets
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name)) return false;
    
  // Pas de nombres
  const numberRegex = /\d/;
  if (numberRegex.test(name)) return false;
    
  // Pas de caractères spéciaux excepté ceux autorisés
  const specialCharRegex = /[^a-zA-ZÀ-ÿ\s'-]/;
  if (specialCharRegex.test(name)) return false;
    
  return true;
};

export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
    
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
    
  return age;
};

export const isChildAgeValid = (birthDate: Date): boolean => {
  const age = calculateAge(birthDate);
  return age >= 0 && age <= 18;
};