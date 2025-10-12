/* eslint-disable no-console */
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { CreateChildRequest } from '../../models/child';

const CHILD_COLLECTION = 'children';

export const ChildService = {
  async createChild(childData: CreateChildRequest): Promise<string> {
    try {
      console.log('🟡 Tentative de création enfant:', childData);
      console.log('🟡 Firebase db object:', db ? 'OK' : 'NULL');
            
      const docRef = await addDoc(collection(db, CHILD_COLLECTION), {
        ...childData,
        birthday: childData.birthday.toISOString(), // Convertir Date en string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
            
      console.log('✅ Enfant créé avec ID:', docRef.id);
      return docRef.id;
            
    } catch (error) {
      console.error('❌ Erreur création enfant:', error);
      throw error;
    }
  },
};