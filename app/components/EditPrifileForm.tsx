import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';


import { useEditProfile } from '../hooks/useEditProfile';
import { User } from '../models/user';

interface EditProfilFormProps {
    user: User;
    onClose(): void;
}
const EditProfilForm: React.FC<EditProfilFormProps> = ({ user, onClose }) => {
  const { onSubmit, editFirstname, editLastname, editMailAddress, editPassword, setEditFistname, setEditLastname, setEditMailAddress, setEditPassword } = useEditProfile(user, onClose);

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder={user.firstname}
        onChangeText={(text) => { setEditFistname(text); }}
        value={editFirstname}
      />
      <TextInput
        style={styles.textInput}
        placeholder={user.lastname}
        onChangeText={(text) => { setEditLastname(text); }}
        value={editLastname}
      />
      <TextInput
        style={styles.textInput}
        placeholder={user.mail_address}
        onChangeText={(text) => { setEditMailAddress(text); }}
        value={editMailAddress}
      />
      <TextInput
        style={styles.textInput}
        placeholder={user.password}
        onChangeText={(text) => { setEditPassword(text); }}
        value={editPassword}
      />
      <Button title="Submit" onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    fontSize: 18,
    borderWidth: 2,
    margin: 10,
  },
});

export default EditProfilForm;