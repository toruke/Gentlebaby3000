import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Task {
  id: string;
  Name: string;
  Icon: string;
  Type: 'recurring' | 'temporal' | 'event';
  Active: boolean;
  Status: 'completed' | 'pending' | 'overdue';
  Tolerance: number;
  assignedMembers: string[];
  createdAt: TaskType|undefined;
  nextOccurrence?: Date;
  fixedTimes?: string[];
  startDateTime?: TaskType|undefined;
}

interface TaskManagerScreenProps {
  navigation: TaskType|undefined;
}

const TaskManagerScreen: React.FC<TaskManagerScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Récupération des tâches depuis Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksList.push({
              id: doc.id,
              ...doc.data(),
            } as Task);
          });
          setTasks(tasksList);
          setFilteredTasks(tasksList);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Erreur lors de la récupération des tâches:', error);
          Alert.alert('Erreur', 'Impossible de charger les tâches');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...tasks];

    if (filterType !== 'all') {
      result = result.filter(task => task.Type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(task => task.Status === filterStatus);
    }

    setFilteredTasks(result);
  }, [filterType, filterStatus, tasks]);

  // Rafraîchir la liste
  const onRefresh = () => {
    setRefreshing(true);
  };

  // Supprimer une tâche
  const handleDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer "${taskName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('tasks').doc(taskId).delete();
              Alert.alert('Succès', 'Tâche supprimée avec succès');
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la tâche');
            }
          },
        },
      ]
    );
  };

  // Désactiver/Activer une tâche
  const handleToggleActive = async (taskId: string, currentStatus: boolean) => {
    try {
      await firestore()
        .collection('tasks')
        .doc(taskId)
        .update({ Active: !currentStatus });

      Alert.alert(
        'Succès',
        currentStatus ? 'Tâche désactivée' : 'Tâche activée'
      );
    } catch (error) {
      console.error('Erreur toggle:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  // Marquer comme terminé
  const handleMarkComplete = async (taskId: string) => {
    try {
      await firestore()
        .collection('tasks')
        .doc(taskId)
        .update({ Status: 'completed' });

      Alert.alert('Succès', 'Tâche validée');
    } catch (error) {
      console.error('Erreur validation:', error);
      Alert.alert('Erreur', 'Impossible de valider la tâche');
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#28a745'; // Vert
      case 'pending':
        return '#ffc107'; // Orange
      case 'overdue':
        return '#dc3545'; // Rouge
      default:
        return '#6c757d';
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En cours';
      case 'overdue':
        return 'En retard';
      default:
        return 'Inconnu';
    }
  };

  // Rendu d'une carte de tâche
  const renderTaskCard = ({ item }: { item: Task }) => (
    <View style={[styles.taskCard, !item.Active && styles.taskCardInactive]}>
      {/* En-tête de la carte */}
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskIcon}>{item.Icon}</Text>
          <View style={styles.taskInfo}>
            <Text style={styles.taskName}>{item.Name}</Text>
            <Text style={styles.taskType}>
              {item.Type === 'recurring' && '🔄 Récurrente'}
              {item.Type === 'temporal' && '⏰ Temporelle'}
              {item.Type === 'event' && '📅 Événement'}
            </Text>
          </View>
        </View>

        {/* Indicateur de statut */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.Status) }
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.Status)}</Text>
        </View>
      </View>

      {/* Informations complémentaires */}
      <View style={styles.taskDetails}>
        {item.Type === 'recurring' && (
          <Text style={styles.detailText}>
            ⏱️ Intervalle: {item.Tolerance}h
          </Text>
        )}
        {item.Type === 'temporal' && item.fixedTimes && (
          <Text style={styles.detailText}>
            🕐 Heures: {item.fixedTimes.join(', ')}
          </Text>
        )}
        <Text style={styles.detailText}>
          👥 {item.assignedMembers.length} membre(s) assigné(s)
        </Text>
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditTask', { taskId: item.id })}
        >
          <Text style={styles.actionButtonText}>✏️ Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            item.Active ? styles.disableButton : styles.enableButton
          ]}
          onPress={() => handleToggleActive(item.id, item.Active)}
        >
          <Text style={styles.actionButtonText}>
            {item.Active ? '⏸️ Désactiver' : '▶️ Activer'}
          </Text>
        </TouchableOpacity>

        {item.Status !== 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleMarkComplete(item.id)}
          >
            <Text style={styles.actionButtonText}>✅ Valider</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTask(item.id, item.Name)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement des tâches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestionnaire de Tâches</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Text style={styles.addButtonText}>+ Nouvelle Tâche</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres par Type */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filtrer par type:</Text>
        <View style={styles.filterButtons}>
          {['all', 'recurring', 'temporal', 'event'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filterType === type && styles.filterButtonActive
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === type && styles.filterButtonTextActive
                ]}
              >
                {type === 'all' && 'Tous'}
                {type === 'recurring' && 'Récurrentes'}
                {type === 'temporal' && 'Temporelles'}
                {type === 'event' && 'Événements'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filtres par Statut */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filtrer par statut:</Text>
        <View style={styles.filterButtons}>
          {['all', 'completed', 'pending', 'overdue'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive
                ]}
              >
                {status === 'all' && 'Tous'}
                {status === 'completed' && '✅ Terminés'}
                {status === 'pending' && '🟡 En cours'}
                {status === 'overdue' && '🔴 Retard'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Liste des tâches */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune tâche trouvée</Text>
            <Text style={styles.emptySubtext}>
              Créez votre première tâche en appuyant sur le bouton ci-dessus
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskCardInactive: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  taskDetails: {
    marginBottom: 12,
    paddingLeft: 44,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  disableButton: {
    backgroundColor: '#ffc107',
  },
  enableButton: {
    backgroundColor: '#28a745',
  },
  completeButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    flex: 0,
    minWidth: 50,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default TaskManagerScreen;