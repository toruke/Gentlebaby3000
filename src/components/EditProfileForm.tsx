import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';


import { useEditProfile } from '../hooks/useEditProfile';

export interface User {
  firstName: string,
  lastName: string,
  email: string,
}

interface EditProfilFormProps {
  onClose(): void;
}
const EditProfileForm: React.FC<EditProfilFormProps> = ( {onClose} ) => {
  const { user, onSubmit, onSubmitPassword, editFirstname, editLastname, editMailAddress, step, currentPassword, newPassword, confirmPassword, setEditFirstname, setEditLastname, setEditMailAddress, setCurrentPassword, setNewPassword, setConfirmPassword, setStep, error } = useEditProfile(onClose);

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder={user?.firstName ?? 'Prénom'}
        onChangeText={(text) => { setEditFirstname(text); }}
        value={editFirstname}
      />
      <TextInput
        style={styles.textInput}
        placeholder={user?.lastName ?? 'Nom'}
        onChangeText={(text) => { setEditLastname(text); }}
        value={editLastname}
      />
      <TextInput
        style={styles.textInput}
        placeholder={user?.email ?? 'email'}
        onChangeText={(text) => { setEditMailAddress(text); }}
        value={editMailAddress}
      />

      {step === 'verify' &&
        (<>
          <TextInput
            style={styles.textInput}
            placeholder='Mot de passe actuel'
            secureTextEntry={true}
            autoCorrect={false}
            onChangeText={(text) => { setCurrentPassword(text); }}
            value={currentPassword} />
          <Button title="Vérifier mot de passe" onPress={onSubmitPassword} />
        </>)
      }
      {step === 'ready' &&
        (<>
          <View style={{ marginVertical: 10 }}>
            <Button title="Modifier mot de passe" onPress={() => { setStep('change'); }} />
          </View>

        </>
        )}

      {step === 'change' &&
        (<>
          <TextInput
            style={styles.textInput}
            placeholder='Nouveau mot de passe'
            secureTextEntry={true}
            autoCorrect={false}
            onChangeText={(text) => { setNewPassword(text); }}
            value={newPassword} />
          <TextInput
            style={styles.textInput}
            placeholder='Confirmation nouveau mot de passe'
            secureTextEntry={true}
            autoCorrect={false}
            onChangeText={(text) => { setConfirmPassword(text); }}
            value={confirmPassword} />
        </>)
      }
      {error.length > 0 &&
        (<Text style={styles.text}>{error}</Text>)
      }
      {(step === 'ready' || step === 'change') &&
        (<>
          <View style={{ marginVertical: 10 }}>
            <Button title="Submit" onPress={onSubmit} />
          </View>
        </>)}
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    fontSize: 18,
    borderWidth: 2,
    margin: 10,
  },
  text: {
    fontSize: 18,
    color: 'red',
    margin: 10,
    fontWeight: 'bold',
  },
});

export default EditProfileForm;