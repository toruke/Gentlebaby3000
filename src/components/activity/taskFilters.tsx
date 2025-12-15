import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskFiltersProps {
  filterType: string;
  filterStatus: string;
  onTypeFilterChange: (type: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterType,
  filterStatus,
  onTypeFilterChange,
  onStatusFilterChange,
}) => (
  <>
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Filtrer par type:</Text>
      <View style={styles.filterButtons}>
        {['all', 'recurring', 'temporal', 'event'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterButtonActive,
            ]}
            onPress={() => onTypeFilterChange(type)}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === type && styles.filterButtonTextActive,
            ]}>
              {type === 'all' && 'Tous'}
              {type === 'recurring' && 'Récurrentes'}
              {type === 'temporal' && 'Temporelles'}
              {type === 'event' && 'Événements'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Filtrer par statut:</Text>
      <View style={styles.filterButtons}>
        {['all', 'completed', 'pending', 'overdue'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => onStatusFilterChange(status)}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === status && styles.filterButtonTextActive,
            ]}>
              {status === 'all' && 'Tous'}
              {status === 'completed' && '✅ Terminés'}
              {status === 'pending' && '🟡 En cours'}
              {status === 'overdue' && '🔴 Retard'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
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
});