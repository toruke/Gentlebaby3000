import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../models/task';
import { TimelineItem, TimelineService } from '../../services/timelineService';

interface TimelineItemCardProps {
  item: TimelineItem;
  onPress: (task: Task) => void;
  testCurrentTime?: Date; 
}

export const TimelineItemCard: React.FC<TimelineItemCardProps> = ({
  item,
  onPress,
  testCurrentTime, // Récupération de la prop
}) => {
  const { task, status, isNextUpcoming, scheduledTime } = item;
  
  const timeStr = TimelineService.formatTime(scheduledTime);
  const color = TimelineService.getStatusColor(status, isNextUpcoming);

  const getTimeStatusText = () => {
    if (!scheduledTime || isNaN(scheduledTime.getTime())) return 'Date invalide';

    // MODIFICATION ICI : On utilise testCurrentTime s'il existe, sinon new Date()
    const now = testCurrentTime || new Date(); 
    
    const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    
    
    if (status === 'overdue') {
      const overdueMinutes = Math.abs(Math.floor(diffMinutes));
      if (overdueMinutes > 60) {
        const hours = Math.floor(overdueMinutes / 60);
        const mins = overdueMinutes % 60;
        return `En retard de ${hours}h ${mins}min`;
      }
      return `En retard de ${overdueMinutes} min`;
    }
    
    if (status === 'current') return 'C\'est le moment !';
    
    if (diffMinutes < 60) return `Dans ${Math.floor(diffMinutes)} min`;
    if (diffMinutes < 120) return `Dans 1h ${Math.floor(diffMinutes % 60)}min`;
    
    if (scheduledTime.getDate() !== now.getDate()) return `Demain à ${timeStr}`;
    
    return `À ${timeStr}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color }]}>{timeStr}</Text>
        <Text style={styles.timeStatus}>{getTimeStatusText()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{task.Icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>{task.Name}</Text>
            <Text style={styles.type}>
              {task.Type === 'recurring' && '🔄 Récurrent'}
              {task.Type === 'temporal' && '⏰ Heure fixe'}
              {task.Type === 'event' && '📅 Événement'}
            </Text>
          </View>
        </View>

        {/* --- C'EST CE BLOC QUI MANQUAIT --- */}
        <View style={styles.details}>
          {task.assignedMembers && task.assignedMembers.length > 0 && (
            <Text style={styles.detailText}>
              👤 {task.assignedMembers.length} membre(s)
            </Text>
          )}
          
          {status === 'overdue' && (
            <Text style={[styles.detailText, { color: '#dc3545', fontWeight: 'bold' }]}>
               🔴 Retard important
            </Text>
          )}
        </View>
        {/* ---------------------------------- */}
      </View>

      {isNextUpcoming && status !== 'overdue' && (
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    width: 75,
    alignItems: 'center',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  timeText: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  timeStatus: { fontSize: 10, color: '#718096', textAlign: 'center', fontWeight: '500' },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { fontSize: 24, marginRight: 12 },
  titleContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#2d3748', marginBottom: 2 },
  type: { fontSize: 11, color: '#a0aec0' },
  // Styles ajoutés pour les détails manquants
  details: { marginLeft: 40, marginTop: 4 },
  detailText: { fontSize: 12, color: '#a0aec0', marginBottom: 2 },
  nextBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nextBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
});