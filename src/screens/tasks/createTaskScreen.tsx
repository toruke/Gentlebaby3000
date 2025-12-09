import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface CreateTaskScreenProps {
  navigation: any;
}

interface Tutor {
  id: string; // ID du document Firestore
  firstname: string;
  name: string;
  email: string;
  password?: string; // Optionnel pour l'affichage
  createdAt?: any;
}


interface FormErrors {
  taskName?: string;
  members?: string;
  interval?: string;
  fixedTimes?: string;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const [taskName, setTaskName] = useState<string>('');
  const [taskIcon, setTaskIcon] = useState<string>('🍼');
  const [responsibleMembers, setResponsibleMembers] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<'recurring' | 'temporal' | 'event'>('recurring');
  const [interval, setInterval] = useState<string>('6');
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [fixedTimes, setFixedTimes] = useState<string>('13:00, 19:00');
  const [comments, setComments] = useState<string>('');
  const [evaluation, setEvaluation] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersSnapshot = await firestore()
          .collection('users')
          .get();

        const usersList: Tutor[] = [];
        
        usersSnapshot.forEach(documentSnapshot => {
          const userData = documentSnapshot.data();
          usersList.push({
            id: documentSnapshot.id,
            firstname: userData.firstname || '',
            name: userData.name || '',
            email: userData.email || '',
          });
        });

        setAvailableTutors(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Se lance une seule fois au montage du composant

  // Liste des tuteurs disponibles
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Liste des icônes disponibles
  const availableIcons = [
    { icon: '🍼', label: 'Biberon' },
    { icon: '🛏️', label: 'Coucher' },
    { icon: '🚽', label: 'Selles' },
    { icon: '🍽️', label: 'Repas' },
    { icon: '🛁', label: 'Bain' },
  ];

  // Toggle sélection des membres
  const toggleMember = (memberId: string): void => {
    setResponsibleMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!taskName.trim()) {
      newErrors.taskName = 'Le nom de la tâche est requis';
    }

    if (responsibleMembers.length === 0) {
      newErrors.members = 'Sélectionnez au moins un tuteur';
    }

    if (taskType === 'recurring') {
      const intervalNum = parseInt(interval);
      if (isNaN(intervalNum) || intervalNum <= 0) {
        newErrors.interval = 'L\'intervalle doit être un nombre positif';
      }
    }

    if (taskType === 'temporal') {
      const times = fixedTimes.split(',').map(t => t.trim()).filter(t => t);
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const invalidTimes = times.filter(t => !timeRegex.test(t));
      
      if (times.length === 0) {
        newErrors.fixedTimes = 'Ajoutez au moins une heure';
      } else if (invalidTimes.length > 0) {
        newErrors.fixedTimes = 'Format invalide (utilisez HH:MM)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async (): Promise<void> => {
  if (!validateForm()) {
    Alert.alert('Erreur', 'Veuillez corriger les erreurs du formulaire');
    return;
  }

  try {
    const newTask: any = {
      Name: taskName.trim(),
      Icon: taskIcon,
      Type: taskType,
      Active: true,
      Status: 'pending',
      Tolerance: 0,
      Validation: false,
      assignedMembers: responsibleMembers,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    if (taskType === 'recurring') {
      newTask.Tolerance = parseInt(interval);
      newTask.startDateTime = firestore.Timestamp.fromDate(startDateTime);
    }

    if (taskType === 'temporal') {
      newTask.fixedTimes = fixedTimes.split(',').map(t => t.trim()).filter(t => t);
    }

    if (taskType === 'event') {
      newTask.comments = comments.trim();
      newTask.evaluation = evaluation;
    }

    const docRef = await firestore()
      .collection('tasks')
      .add(newTask);

    console.log('Tâche créée avec ID:', docRef.id);

    Alert.alert(
      'Succès',
      'Tâche créée avec succès !',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    Alert.alert('Erreur', 'Impossible de créer la tâche. Veuillez réessayer.');
  }
};



  const onDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateTime(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer une nouvelle tâche</Text>

      {/* Nom de la tâche */}
      <TextInput
        style={[styles.input, errors.taskName && styles.inputError]}
        placeholder="Nom de la tâche"
        value={taskName}
        onChangeText={(text: string) => {
          setTaskName(text);
          if (errors.taskName) setErrors({...errors, taskName: undefined});
        }}
      />
      {errors.taskName && <Text style={styles.errorText}>{errors.taskName}</Text>}

      {/* Icône - Remplacé par des boutons */}
      <Text style={styles.label}>Icône :</Text>
      <View style={styles.iconContainer}>
        {availableIcons.map(item => (
          <TouchableOpacity
            key={item.icon}
            style={[
              styles.iconButton,
              taskIcon === item.icon && styles.iconButtonSelected
            ]}
            onPress={() => setTaskIcon(item.icon)}>
            <Text style={styles.iconEmoji}>{item.icon}</Text>
            <Text style={styles.iconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

  {/* Membres responsables */}
  <Text style={styles.label}>Tuteurs responsables :</Text>
  {loading ? (
    <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
  ) : (
    <View style={styles.membersContainer}>
      {availableTutors.map(tutor => (
        <TouchableOpacity
          key={tutor.id}
          style={[
            styles.memberButton,
            responsibleMembers.includes(tutor.id) && styles.memberButtonSelected
          ]}
          onPress={() => {
            toggleMember(tutor.id);
            if (errors.members) setErrors({...errors, members: undefined});
          }}>
          <Text style={[
            styles.memberButtonText,
            responsibleMembers.includes(tutor.id) && styles.memberButtonTextSelected
          ]}>
            {tutor.firstname} {tutor.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
  {errors.members && <Text style={styles.errorText}>{errors.members}</Text>}


      {/* Type de tâche */}
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

      {/* Champs spécifiques aux tâches récurrentes */}
      {taskType === 'recurring' && (
        <View>
          <TextInput
            style={[styles.input, errors.interval && styles.inputError]}
            placeholder="Intervalle (heures)"
            value={interval}
            onChangeText={(text: string) => {
              setInterval(text);
              if (errors.interval) setErrors({...errors, interval: undefined});
            }}
            keyboardType="numeric"
          />
          {errors.interval && <Text style={styles.errorText}>{errors.interval}</Text>}

          <Text style={styles.label}>Début de la tâche :</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}>
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

      {/* Champs spécifiques aux tâches temporelles */}
      {taskType === 'temporal' && (
        <View>
          <TextInput
            style={[styles.input, errors.fixedTimes && styles.inputError]}
            placeholder="Heures fixes (ex: 13:00, 19:00)"
            value={fixedTimes}
            onChangeText={(text: string) => {
              setFixedTimes(text);
              if (errors.fixedTimes) setErrors({...errors, fixedTimes: undefined});
            }}
          />
          {errors.fixedTimes && <Text style={styles.errorText}>{errors.fixedTimes}</Text>}
          <Text style={styles.helpText}>
            Séparez les heures par des virgules (format 24h)
          </Text>
        </View>
      )}

      {/* Champs spécifiques aux événements */}
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
                  evaluation === value && styles.evaluationButtonSelected
                ]}
                onPress={() => setEvaluation(value)}>
                <Text style={[
                  styles.evaluationText,
                  evaluation === value && styles.evaluationTextSelected
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

      <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
        <Text style={styles.createButtonText}>Créer la tâche</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  memberButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
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
  loadingText: {
  fontSize: 14,
  color: '#999',
  textAlign: 'center',
  padding: 15,
  fontStyle: 'italic',
},
});

export default CreateTaskScreen;