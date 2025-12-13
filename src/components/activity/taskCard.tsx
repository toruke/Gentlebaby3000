import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../models/task';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onToggleActive: (taskId: string, currentActive: boolean) => Promise<void>;
  onMarkComplete: (taskId: string) => Promise<void>;
  onDelete: (taskId: string, taskName: string) => Promise<void>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onToggleActive,
  onMarkComplete,
  onDelete,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
    case 'completed': return '#28a745';
    case 'pending': return '#ffc107';
    case 'overdue': return '#dc3545';
    default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
    case 'completed': return 'Terminé';
    case 'pending': return 'En cours';
    case 'overdue': return 'En retard';
    default: return 'Inconnu';
    }
  };

  return (
    <View style={[styles.taskCard, !task.Active && styles.taskCardInactive]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskIcon}>{task.Icon}</Text>
          <View style={styles.taskInfo}>
            <Text style={styles.taskName}>{task.Name}</Text>
            <Text style={styles.taskType}>
              {task.Type === 'recurring' && '🔄 Récurrente'}
              {task.Type === 'temporal' && '⏰ Temporelle'}
              {task.Type === 'event' && '📅 Événement'}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(task.Status) },
        ]}>
          <Text style={styles.statusText}>{getStatusLabel(task.Status)}</Text>
        </View>
      </View>

      <View style={styles.taskDetails}>
        {task.Type === 'recurring' && (
          <Text style={styles.detailText}>⏱️ Intervalle: {task.Tolerance}h</Text>
        )}
        {task.Type === 'temporal' && task.fixedTimes && (
          <Text style={styles.detailText}>🕐 Heures: {task.fixedTimes.join(', ')}</Text>
        )}
        <Text style={styles.detailText}>👥 {task.assignedMembers.length} membre(s) assigné(s)</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(task.id)}
        >
          <Text style={styles.actionButtonText}>✏️ Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            task.Active ? styles.disableButton : styles.enableButton,
          ]}
          onPress={() => onToggleActive(task.id, task.Active)}
        >
          <Text style={styles.actionButtonText}>
            {task.Active ? '⏸️ Désactiver' : '▶️ Activer'}
          </Text>
        </TouchableOpacity>

        {task.Status !== 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onMarkComplete(task.id)}
          >
            <Text style={styles.actionButtonText}>✅ Valider</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => Alert.alert(
            'Confirmer la suppression',
            `Voulez-vous vraiment supprimer "${task.Name}" ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Supprimer',
                style: 'destructive',
                onPress: () => onDelete(task.id, task.Name),
              },
            ],
          )}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
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

});

