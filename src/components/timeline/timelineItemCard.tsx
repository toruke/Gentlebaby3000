import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../models/task';
import { TimelineItem, TimelineService } from '../../services/timelineService';

interface TimelineItemCardProps {
  item: TimelineItem;
  onPress: (task: Task) => void;
  toleranceMinutes?: number;
}

export const TimelineItemCard: React.FC<TimelineItemCardProps> = ({
  item,
  onPress,
  toleranceMinutes = 15,
}) => {
  const { task, status, isNextUpcoming, scheduledTime } = item;
  const color = TimelineService.getStatusColor(status, isNextUpcoming);
  const timeStr = TimelineService.formatTime(scheduledTime);

  const getTimeStatusText = () => {
    const now = new Date();
    const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (status === 'overdue') {
      const overdueMinutes = Math.abs(Math.floor(diffMinutes));
      return `En retard de ${overdueMinutes} min`;
    }
    
    if (status === 'current') {
      return `Dans ${Math.floor(diffMinutes)} min`;
    }
    
    if (diffMinutes < 60) {
      return `Dans ${Math.floor(diffMinutes)} min`;
    }
    
    if (diffMinutes < 120) {
      return 'Dans 1h';
    }
    
    return `À ${timeStr}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color }]}>
          {timeStr}
        </Text>
        <Text style={styles.timeStatus}>
          {getTimeStatusText()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{task.Icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {task.Name}
            </Text>
            <Text style={styles.type}>
              {task.Type === 'recurring' && '🔄 Récurrent'}
              {task.Type === 'temporal' && '⏰ Temporel'}
              {task.Type === 'event' && '📅 Événement'}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          {task.assignedMembers && task.assignedMembers.length > 0 && (
            <Text style={styles.detailText}>
              👤 {task.assignedMembers.length} membre(s)
            </Text>
          )}
          
          {status === 'current' && toleranceMinutes > 0 && (
            <Text style={[styles.detailText, { color: '#fd7e14' }]}>
              ⚠️ Dans sa fenêtre d'exécution
            </Text>
          )}
          
          {status === 'overdue' && (
            <Text style={[styles.detailText, { color: '#dc3545' }]}>
              🔴 Action requise
            </Text>
          )}
        </View>
      </View>

      {isNextUpcoming && status === 'upcoming' && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>SUIVANT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    width: 70,
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeStatus: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#718096',
  },
  details: {
    marginLeft: 40, // Pour s'aligner sous le nom (icon width + margin)
  },
  detailText: {
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 2,
  },
  nextBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nextBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});