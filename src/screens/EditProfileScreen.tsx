import { useState } from 'react';
import { Button } from 'react-native';
import EditProfileForm from '../components/EditProfileForm';

const data = [
  { id: '1', firstname: 'Remy', lastname: 'Ratatouille', mail_address: 's.remy@gmail.com', password: 'Remy_54?' },
];

export const EditProfileScreen = () => {
  const [editProfil, setEditProfil] = useState<boolean>(false);
  return (
    <>
      <Button
        onPress={() => setEditProfil(true)}
        title="Modification profil utilisateur"
        color="#841584"
      />
      {editProfil && <EditProfileForm user={data[0]} onClose={() => setEditProfil(false)} />}
    </>
  );
};