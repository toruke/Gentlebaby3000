// src/hooks/useCreateTask.ts
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { db } from '../../config/firebaseConfig';
import { taskService } from '../services/taskService';
import { TaskType, TaskStatus, Tutor } from '../models/task'; // Assure-toi que ce chemin est bon

// Interfaces locales
export interface FormErrors {
  taskName?: string;
  members?: string;
  interval?: string;
  fixedTimes?: string;
}

interface CreateTaskData {
  Name: string;
  Icon: string;
  Type: TaskType;
  Active: boolean;
  Status: TaskStatus;
  Tolerance: number;
  Validation: boolean;
  assignedMembers: string[];
  startDateTime?: Date | Timestamp;
  nextOccurrence?: Date;
  fixedTimes?: string[];
  comments?: string;
  evaluation?: number;
}

export const useCreateTask = (familyId: string | undefined) => {
  const router = useRouter();

  // --- ÉTATS ---
  const [taskName, setTaskName] = useState<string>('');
  const [taskIcon, setTaskIcon] = useState<string>('🍼');
  const [responsibleMembers, setResponsibleMembers] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<TaskType>('recurring');
  const [interval, setInterval] = useState<string>('6');
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [fixedTimes, setFixedTimes] = useState<string>('13:00, 19:00');
  const [comments, setComments] = useState<string>('');
  const [evaluation, setEvaluation] = useState<number>(0);
  
  // États UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // --- CHARGEMENT DES MEMBRES ---
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!familyId) return;

      try {
        setLoading(true);
        console.log(`🔍 Recherche des membres pour la famille : ${familyId}`);

        let querySnapshot = await getDocs(collection(db, 'family', familyId, 'members'));
        
        if (querySnapshot.empty) {
          console.log('⚠️ Pas de membres, fallback sur users global...');
          querySnapshot = await getDocs(collection(db, 'users'));
        }

        const usersList: Tutor[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          usersList.push({
            id: doc.id,
            firstname: data.firstname || data.displayName || data.firstName || 'Inconnu',
            name: data.name || data.lastName || '',
            email: data.email || 'Pas d\'email',
          });
        });

        setAvailableTutors(usersList);
      } catch (error) {
        console.error('❌ Erreur chargement membres:', error);
        Alert.alert('Erreur', 'Impossible de charger les membres');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [familyId]);

  // --- LOGIQUE MÉTIER ---

  const toggleMember = (memberId: string): void => {
    setResponsibleMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId],
    );
    // Nettoyer l'erreur si sélectionné
    if (errors.members) setErrors(prev => ({ ...prev, members: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!taskName.trim()) newErrors.taskName = 'Le nom est requis';
    if (responsibleMembers.length === 0) newErrors.members = 'Sélectionnez au moins un tuteur';

    if (taskType === 'recurring') {
      const intervalNum = parseInt(interval, 10);
      if (isNaN(intervalNum) || intervalNum <= 0) {
        newErrors.interval = 'Intervalle invalide';
      }
    }

    if (taskType === 'temporal') {
      const times = fixedTimes.split(',').map(t => t.trim()).filter(t => t);
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const invalidTimes = times.filter(t => !timeRegex.test(t));

      if (times.length === 0) newErrors.fixedTimes = 'Ajoutez une heure';
      else if (invalidTimes.length > 0) newErrors.fixedTimes = 'Format invalide (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNextOccurrence = (): Date => {
    const now = new Date();
    
    if (taskType === 'recurring') {
      const intervalNum = parseInt(interval, 10);
      const nextDate = new Date(startDateTime);
      
      while (nextDate <= now) {
        nextDate.setHours(nextDate.getHours() + intervalNum);
      }
      return nextDate;
    }
    
    if (taskType === 'temporal') {
      const times = fixedTimes.split(',').map(t => t.trim()).filter(t => t);
      const today = new Date();
      const currentHourMin = today.toTimeString().substring(0, 5);
      
      // Trier les heures pour être sûr
      times.sort(); 

      for (const fixedTime of times) {
        if (fixedTime > currentHourMin) {
          const [hours, minutes] = fixedTime.split(':').map(Number);
          const nextDate = new Date(today);
          nextDate.setHours(hours, minutes, 0, 0);
          return nextDate;
        }
      }
      
      // Si aucune heure trouvée aujourd'hui, prendre la première de demain
      const [hours, minutes] = times[0].split(':').map(Number);
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + 1);
      nextDate.setHours(hours, minutes, 0, 0);
      return nextDate;
    }
    
    return startDateTime;
  };

  const submit = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert('Attention', 'Veuillez corriger le formulaire');
      return;
    }

    if (!familyId) {
      Alert.alert('Erreur', 'ID Famille manquant');
      return;
    }

    try {
      setIsSubmitting(true);

      const createTaskData: CreateTaskData = {
        Name: taskName.trim(),
        Icon: taskIcon,
        Type: taskType,
        Active: true,
        Status: 'pending' as TaskStatus,
        Tolerance: 0,
        Validation: false,
        assignedMembers: responsibleMembers,
        nextOccurrence: calculateNextOccurrence(),
      };

      if (taskType === 'recurring') {
        createTaskData.Tolerance = parseInt(interval, 10);
        createTaskData.startDateTime = Timestamp.fromDate(startDateTime);
      }

      if (taskType === 'temporal') {
        createTaskData.fixedTimes = fixedTimes.split(',').map(t => t.trim()).filter(t => t);
      }

      if (taskType === 'event') {
        createTaskData.comments = comments.trim();
        createTaskData.evaluation = evaluation;
        createTaskData.startDateTime = Timestamp.fromDate(startDateTime);
      }

      await taskService.createTask(familyId, createTaskData);
      console.log('✅ Tâche créée');

      Alert.alert('Succès', 'Tâche créée avec succès !', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Erreur création tâche:', error);
      Alert.alert('Erreur', 'Impossible de créer la tâche.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateTime(selectedDate);
    }
  };

  // Helper pour nettoyer les erreurs lors de la saisie
  const handleTextChange = (setter: React.Dispatch<React.SetStateAction<string>>, errorKey?: keyof FormErrors) => (text: string) => {
    setter(text);
    if (errorKey && errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  return {
    // Values
    taskName, taskIcon, responsibleMembers, taskType, interval, startDateTime, fixedTimes, comments, evaluation,
    availableTutors, loading, isSubmitting, errors, showDatePicker,
    // Setters & Actions
    setTaskName, setTaskIcon, setTaskType, setInterval, setFixedTimes, setComments, setEvaluation, setShowDatePicker,
    handleTextChange, toggleMember, onDateChange, submit,
  };
};