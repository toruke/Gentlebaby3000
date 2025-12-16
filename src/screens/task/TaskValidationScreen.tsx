import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../config/firebaseConfig';

export default function TaskValidationScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleValidate = async () => {
    if (!taskId) return;

    try {
      setSaving(true);

      // 🔄 Validation réelle de la tâche
      await updateDoc(doc(db, 'tasks', taskId), {
        validated: true,
        validatedAt: serverTimestamp(),
        comment: comment || null,
      });

      router.back();
    } catch (e) {
      console.error('Erreur validation tâche', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validation de la tâche</Text>

      <TextInput
        style={styles.input}
        placeholder="Commentaire (optionnel)"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.disabled]}
        onPress={handleValidate}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Validation...' : 'Valider la tâche'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
