import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../config/firebaseConfig';

export default function Profil() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.replace('/');

      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'users', u.uid));

        if (snap.exists()) {
          const f = snap.get('firstName') ?? '';
          const l = snap.get('lastName') ?? '';
          const m = snap.get('email') ?? u.email ?? '';

          let f2 = f, l2 = l;
          if (!f && !l && u.displayName) {
            const parts = u.displayName.split(' ');
            f2 = parts[0] ?? '';
            l2 = parts.slice(1).join(' ') ?? '';
          }

          setFirstName(f2);
          setLastName(l2);
          setEmail(m);
        } else {
          let f = '', l = '';
          if (u.displayName) {
            const parts = u.displayName.split(' ');
            f = parts[0] ?? '';
            l = parts.slice(1).join(' ') ?? '';
          }
          setFirstName(f);
          setLastName(l);
          setEmail(u.email ?? '');
        }
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  if (loading) {
    return <View style={styles.center}><Text>Chargement…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes informations</Text>
      <ROInput label="Prénom" value={firstName} />
      <ROInput label="Nom" value={lastName} />
      <ROInput label="Email" value={email} keyboardType="email-address" />
    </View>


  );
}

function ROInput({ label, value, keyboardType }: { label: string; value: string; keyboardType?: 'email-address' | 'default' }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.inputMuted]}
        value={value}
        editable={false}
        selectTextOnFocus={false}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize' },
  label: { marginBottom: 6, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, color: '#111',
  },
  inputMuted: { backgroundColor: '#f0f0f0', color: '#777' },
});
