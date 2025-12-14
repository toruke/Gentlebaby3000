import { router, useFocusEffect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { auth, db } from '../../config/firebaseConfig';
import { Alert } from 'react-native';
import { getProfileUser, updateTheEmail } from '../services/EditProfileService';

export function useCurrentUserProfile() {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string|null>(null);
  
  const [needsEmailSync, setNeedsEmailSync] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);

  const checkEmailSyncStatus = useCallback(async (uid: string) => {
    if (!uid) return false;
    const u = auth.currentUser;
    if (!u) return false;
    
    // Recharge l'utilisateur Auth pour obtenir l'email le plus récent
    await u.reload();
    const authEmail = u.email;

    const snap = await getDoc(doc(db, 'user', uid));
    if (snap.exists()) {
      const firestoreEmail = snap.get('email');
      // S'il y a une différence entre Auth et Firestore, on a besoin de synchroniser
      const needed = !!authEmail && authEmail !== firestoreEmail;
      setNeedsEmailSync(needed);
      return needed;
    }
    setNeedsEmailSync(false);
    return false;
  }, []);


  const fetchUserProfile  = useCallback(async (uid: string)=>{
    if (!uid) return ;
    try {
      const u = auth.currentUser;
      setLoading(true);
      const snap = await getDoc(doc(db, 'user', uid));

      if (snap.exists()) {
        const f = snap.get('firstName') ?? '';
        const l = snap.get('lastName') ?? '';
        const m = snap.get('email') ?? u?.email ?? '';

        let f2 = f, l2 = l;
        if (!f && !l && u?.displayName) {
          const parts = u.displayName.split(' ');
          f2 = parts[0] ?? '';
          l2 = parts.slice(1).join(' ') ?? '';
        }

        setFirstName(f2);
        setLastName(l2);
        setEmail(m);
      } else {
        let f = '', l = '';
        if (u?.displayName) {
          const parts = u.displayName.split(' ');
          f = parts[0] ?? '';
          l = parts.slice(1).join(' ') ?? '';
        }
        setFirstName(f);
        setLastName(l);
        setEmail(u?.email ?? '');
      }
      await checkEmailSyncStatus(uid);
    } finally {
      setLoading(false);
    }
  }, [checkEmailSyncStatus]);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace('/');
      setUserId(u.uid);
    });
    return unsub;

  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserProfile(userId);
      }
    }, [userId, fetchUserProfile]),
  );
  const syncEmail = useCallback(async () => {
    const u = auth.currentUser;
    if (!u || !userId) return 'Utilisateur non connecté ou UID manquant';
    
    setIsSyncing(true);
    try {
      // 1. Recharge l'utilisateur pour avoir le nouvel email validé
      await u.reload();
      const refreshedEmail = u.email;

      // 2. Récupère le document Firestore
      const snap = await getProfileUser(); // Assurez-vous que getProfileUser est disponible et récupère le snapshot
      if (snap.empty) throw new Error('Document utilisateur manquant');

      const userDoc = snap.docs[0];
      const firestoreEmail = userDoc.data().email;

      if (refreshedEmail && refreshedEmail !== firestoreEmail) {
        // 3. Met à jour Firestore
        const resultMail = await updateTheEmail(userDoc.id, refreshedEmail); // Nécessite l'import de updateTheEmail
        if (resultMail.includes('réussie')) {
          setEmail(refreshedEmail); // Met à jour l'état local
          setNeedsEmailSync(false); // Plus besoin de synchroniser
          Alert.alert('Succès', 'L\'email a bien été vérifiée et mis à jour.');
        } else {
          Alert.alert('Erreur', resultMail);
        }
      } else {
        setNeedsEmailSync(false);
      }
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      Alert.alert('Erreur', 'Erreur lors de la synchronisation de l\'email.');
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);
  
  return { firstName, lastName, email, loading,needsEmailSync, isSyncing, syncEmail};
}
