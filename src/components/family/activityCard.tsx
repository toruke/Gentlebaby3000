import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UpcomingActivity } from '../../models/family';

interface ActivityCardProps {
  activity: UpcomingActivity;
  onMarkAsDone?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onMarkAsDone, 
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>🕐 Prochaine activité</Text>
    <View style={styles.content}>
      <View>
        <Text style={styles.childName}>👶 {activity.childName}</Text>
        <Text style={styles.taskName}>{activity.taskName}</Text>
        <Text style={styles.time}>Dans 15min • Assigné à {activity.assignedTo}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onMarkAsDone}>
        <Text style={styles.buttonText}>Marquer fait</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: 4,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#718096',
  },
  button: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
});