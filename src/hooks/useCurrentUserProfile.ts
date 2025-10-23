import { router, useFocusEffect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { auth, db } from '../../config/firebaseConfig';

export function useCurrentUserProfile() {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string|null>(null);


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
    } finally {
      setLoading(false);
    }
  }, []);

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
  return { firstName, lastName, email, loading};
}
