import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, Timestamp } from 'firebase/firestore'; 
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../../../config/firebaseConfig';
import { taskService } from '../../services/taskService';
import { TaskType, TaskStatus, Tutor } from '../../models/task';

interface FormErrors {
  taskName?: string;
  members?: string;
  interval?: string;
  fixedTimes?: string;
}

interface AvailableIcon {
  icon: string;
  label: string;
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

export default function CreateTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawId = params.id;
  const familyId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [taskName, setTaskName] = useState<string>('');
  const [taskIcon, setTaskIcon] = useState<string>('🍼');
  const [responsibleMembers, setResponsibleMembers] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<TaskType>('recurring');
  const [interval, setInterval] = useState<string>('6');
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [fixedTimes, setFixedTimes] = useState<string>('13:00, 19:00');
  const [comments, setComments] = useState<string>('');
  const [evaluation, setEvaluation] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableIcons: AvailableIcon[] = [
    { icon: '🍼', label: 'Biberon' },
    { icon: '🛏️', label: 'Coucher' },
    { icon: '🚽', label: 'Selles' },
    { icon: '🍽️', label: 'Repas' },
    { icon: '🛁', label: 'Bain' },
    { icon: '💊', label: 'Médicament' },
    { icon: '🎮', label: 'Jeu' },
  ];

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!familyId) return;

      try {
        setLoading(true);
        console.log(`🔍 Recherche des membres pour la famille : ${familyId}`);

        let querySnapshot = await getDocs(collection(db, 'family', familyId, 'members'));
        
        if (querySnapshot.empty) {
          console.log('⚠️ Pas de membres dans la famille, tentative chargement \'users\' global...');
          querySnapshot = await getDocs(collection(db, 'users'));
        }

        console.log(`📊 Nombre de documents trouvés : ${querySnapshot.size}`);

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

  const toggleMember = (memberId: string): void => {
    setResponsibleMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId],
    );
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
      
      for (const fixedTime of times) {
        if (fixedTime > currentHourMin) {
          const [hours, minutes] = fixedTime.split(':').map(Number);
          const nextDate = new Date(today);
          nextDate.setHours(hours, minutes, 0, 0);
          return nextDate;
        }
      }
      
      const [hours, minutes] = times[0].split(':').map(Number);
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + 1);
      nextDate.setHours(hours, minutes, 0, 0);
      return nextDate;
    }
    
    return startDateTime;
  };

  const handleCreateTask = async (): Promise<void> => {
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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateTime(selectedDate);
    }
  };

  const handleTextChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    errorKey?: keyof FormErrors,
  ) => {
    return (text: string) => {
      setter(text);
      if (errorKey && errors[errorKey]) {
        setErrors(prev => ({ ...prev, [errorKey]: undefined }));
      }
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, marginRight: 10 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Créer une nouvelle tâche</Text>
      </View>

      <TextInput
        style={[styles.input, errors.taskName && styles.inputError]}
        placeholder="Nom de la tâche"
        value={taskName}
        onChangeText={handleTextChange(setTaskName, 'taskName')}
      />
      {errors.taskName && <Text style={styles.errorText}>{errors.taskName}</Text>}

      <Text style={styles.label}>Icône :</Text>
      <View style={styles.iconContainer}>
        {availableIcons.map(item => (
          <TouchableOpacity
            key={item.icon}
            style={[
              styles.iconButton,
              taskIcon === item.icon && styles.iconButtonSelected,
            ]}
            onPress={() => setTaskIcon(item.icon)}
          >
            <Text style={styles.iconEmoji}>{item.icon}</Text>
            <Text style={styles.iconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tuteurs responsables :</Text>
      {loading ? (
        <ActivityIndicator color="#8E59FF" />
      ) : availableTutors.length === 0 ? (
        <View style={styles.emptyMembersBox}>
          <Text style={styles.emptyMembersText}>Aucun membre trouvé.</Text>
          <Text style={styles.emptyMembersSubtext}>Vérifiez votre base de données.</Text>
        </View>
      ) : (
        <View style={styles.membersContainer}>
          {availableTutors.map(tutor => (
            <TouchableOpacity
              key={tutor.id}
              style={[
                styles.memberButton,
                responsibleMembers.includes(tutor.id) && styles.memberButtonSelected,
              ]}
              onPress={() => {
                toggleMember(tutor.id);
                if (errors.members) setErrors({ ...errors, members: undefined });
              }}
            >
              <Text style={[
                styles.memberButtonText,
                responsibleMembers.includes(tutor.id) && styles.memberButtonTextSelected,
              ]}>
                {tutor.firstname} {tutor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errors.members && <Text style={styles.errorText}>{errors.members}</Text>}

      <View style={styles.taskTypeContainer}>
        <Text style={styles.label}>Type de tâche :</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity onPress={() => setTaskType('recurring')}>
            <Text style={taskType === 'recurring' ? styles.selectedRadio : styles.radio}>
              Occurrente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTaskType('temporal')}>
            <Text style={taskType === 'temporal' ? styles.selectedRadio : styles.radio}>
              Temporel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTaskType('event')}>
            <Text style={taskType === 'event' ? styles.selectedRadio : styles.radio}>
              Événementiel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {taskType === 'recurring' && (
        <View>
          <TextInput
            style={[styles.input, errors.interval && styles.inputError]}
            placeholder="Intervalle (heures)"
            value={interval}
            onChangeText={handleTextChange(setInterval, 'interval')}
            keyboardType="numeric"
          />
          {errors.interval && <Text style={styles.errorText}>{errors.interval}</Text>}

          <Text style={styles.label}>Début de la tâche :</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {startDateTime.toLocaleString('fr-FR')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={startDateTime}
              mode="datetime"
              display="default"
              onChange={onDateChange}
              {...(Platform.OS === 'android' ? { is24Hour: true } : {})}
            />
          )}
        </View>
      )}

      {taskType === 'temporal' && (
        <View>
          <TextInput
            style={[styles.input, errors.fixedTimes && styles.inputError]}
            placeholder="Heures fixes (ex: 13:00, 19:00)"
            value={fixedTimes}
            onChangeText={handleTextChange(setFixedTimes, 'fixedTimes')}
          />
          {errors.fixedTimes && <Text style={styles.errorText}>{errors.fixedTimes}</Text>}
          <Text style={styles.helpText}>
            Séparez les heures par des virgules (format 24h)
          </Text>
        </View>
      )}

      {taskType === 'event' && (
        <View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Commentaires"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Évaluation :</Text>
          <View style={styles.evaluationContainer}>
            {[0, 1, 2, 3, 4, 5].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.evaluationButton,
                  evaluation === value && styles.evaluationButtonSelected,
                ]}
                onPress={() => setEvaluation(value)}
              >
                <Text style={[
                  styles.evaluationText,
                  evaluation === value && styles.evaluationTextSelected,
                ]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>
            0 = Aucun problème • 5 = Grave
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.createButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleCreateTask}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Créer la tâche</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    width: '28%',
  },
  iconButtonSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  iconEmoji: {
    fontSize: 30,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 11,
    color: '#666',
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  memberButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  memberButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  memberButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  memberButtonTextSelected: {
    color: '#2196f3',
  },
  emptyMembersBox: {
    padding: 15,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyMembersText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  emptyMembersSubtext: {
    color: '#721c24',
    fontSize: 12,
  },
  taskTypeContainer: {
    marginBottom: 15,
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radio: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 14,
  },
  selectedRadio: {
    padding: 12,
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  evaluationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  evaluationButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  evaluationButtonSelected: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  evaluationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  evaluationTextSelected: {
    color: '#856404',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: -5,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});