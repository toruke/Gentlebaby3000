import { useState } from 'react';
import { User } from '../models/user';


export const useEditProfile = (user: User, onClose: () => void) => {

  const [editFirstname, setEditFistname] = useState<string>(user.firstname);
  const [editLastname, setEditLastname] = useState<string>(user.lastname);
  const [editMailAddress, setEditMailAddress] = useState<string>(user.mail_address);
  const [editPassword, setEditPassword] = useState<string>(user.password);

  const onSubmit = () => {
    const updateUser: User = {
      id: user.id,
      firstname: editFirstname,
      lastname: editLastname,
      mail_address: editMailAddress,
      password: editPassword,
    };
    console.log(updateUser);
    onClose();
  };

  return { onSubmit, editFirstname, editLastname, editMailAddress, editPassword, setEditFistname, setEditLastname, setEditMailAddress, setEditPassword };
};