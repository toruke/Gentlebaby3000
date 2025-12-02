import { Family, UpcomingActivity } from '../models/family';

export const getMockFamilyData = (): Family => ({
  id: 'family-1',
  familyName: 'Dubois',
  createdBy: 'user-1',
  members: [
    {
      id: 'user-1',
      firstName: 'Maggie',
      lastName: 'Dubois',
      role: 'TUTOR',
      email: 'maggie@example.com',
    },
    {
      id: 'user-2', 
      firstName: 'Pierre',
      lastName: 'Dubois',
      role: 'TUTOR',
      email: 'pierre@example.com',
    },
  ],
  children: [
    {
      id: 'child-1',
      firstName: 'Lucas',
      lastName: 'Dubois',
      birthDate: new Date('2023-05-15'),
    },
  ],
  settings: {
    familyName: 'Dubois',
    notifications: {
      tasks: true,
      shifts: true,
      health: true,
    },
  },
});

export const getMockUpcomingActivity = (): UpcomingActivity | null => ({
  id: 'activity-1',
  childName: 'Lucas',
  taskName: 'Biberon',
  scheduledTime: new Date(Date.now() + 15 * 60 * 1000), // Dans 15min
  assignedTo: 'Maggie',
  type: 'FEEDING',
});