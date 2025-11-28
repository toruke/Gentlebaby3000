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

export interface UpcomingActivity {
  id: string;
  childName: string;
  taskName: string;
  scheduledTime: Date;
  assignedTo: string;
  type: 'HEALTH' | 'FEEDING' | 'SLEEP' | 'HYGIENE';
}
export type Family = {
    familyId: string;
    name: string;
    createdBy: string;
    createdAt: Date;
    photoUrl?: string;
    members: string[];
};
