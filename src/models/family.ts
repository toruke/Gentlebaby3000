export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: 'tuteur' | 'tuteur secondaire' | 'membre' | 'enfant';
  email: string;
  avatar?: string;
}

export interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
}

export interface FamilySettings {
  familyName: string;
  notifications: {
    tasks: boolean;
    shifts: boolean;
    health: boolean;
  };
}