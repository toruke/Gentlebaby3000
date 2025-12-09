import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { TimelineItem, TimelineService } from '../../services/timelineService';

interface WeatherTimelineBarProps {
  timelineItems: TimelineItem[];
  onItemPress: (index: number) => void;
  currentTime: Date;
}

export const WeatherTimelineBar: React.FC<WeatherTimelineBarProps> = ({
  timelineItems,
  currentTime,
}) => {
  if (timelineItems.length === 0) {
    return (
      <View style={styles.emptyBar}>
        <Text style={styles.emptyText}>Aucun événement aujourd'hui</Text>
      </View>
    );
  }

  // Filtrer pour n'avoir que les prochaines 6 heures
  const nextSixHours = new Date(currentTime.getTime() + 6 * 60 * 60 * 1000);
  const upcomingItems = timelineItems.filter(item => 
    item.scheduledTime <= nextSixHours && 
    item.status !== 'completed',
  );

  if (upcomingItems.length === 0) {
    return (
      <View style={styles.emptyBar}>
        <Text style={styles.emptyText}>Plus d'événements aujourd'hui</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prochaines heures</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {upcomingItems.map((item) => {
          const color = TimelineService.getStatusColor(item.status, item.isNextUpcoming);
          const time = TimelineService.formatTime(item.scheduledTime);
          
          return (
            <View 
              key={item.id} 
              style={styles.hourContainer}
            >
              <View style={styles.timeBubble}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.icon}>{item.task.Icon}</Text>
              </View>
              
              <Text style={styles.taskName} numberOfLines={1}>
                {item.task.Name}
              </Text>
              
              {item.status === 'overdue' && (
                <View style={styles.overdueDot} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  emptyBar: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  hourContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  timeBubble: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 22,
    color: '#ffffff',
  },
  taskName: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    width: '100%',
  },
  overdueDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});