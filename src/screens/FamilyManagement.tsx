import { useState } from 'react';
import { Button } from 'react-native';
import type { FamilyMember } from '../components/FamilyMember';
import { FamilyMembers } from '../components/FamilyMember';
const familyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Maggie Parent',
    role: 'Tuteur',
    device:
    {
      id: '1-1',
      serialNumber: 'NS25412-54',
      type: 'receiver',
      status: 'connected',
      pairedAt: '11/11/2025',
      lastSeen: 'Maintenant',
    },
  },
  {
    id: '2',
    name: 'Lucas',
    role: 'Enfant',
    device:
    {
      id: '2-1',
      serialNumber: 'NS25412-55',
      type: 'transmitter',
      status: 'connected',
      pairedAt: '11/11/2025',
      lastSeen: 'Maintenant',
    },
  },

  {
    id: '4',
    name: 'Grand-mère',
    role: 'Membre',
    device:
    {
      id: '3-1',
      serialNumber: 'NS25412-54',
      type: 'receiver',
      status: 'disconnected',
      pairedAt: '11/11/2025',
      lastSeen: 'Hier, 14:30',
    },
  },
  {
    id: '5',
    name: 'Jean Dupont',
    role: 'Enfant',
  },
];

export default function FamilyManagement() {
  const [roleDevice, setRoleDevice] = useState<boolean>(false);
  return (
    <>
      {!roleDevice &&
      <Button
        onPress={() => setRoleDevice(true)}
        title="Modification profil utilisateur"
        color="#6b46c1"
      />}
      { roleDevice && <FamilyMembers familyMembers={familyMembers} />}
    </>
  );
};