import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { TimelineItem, TimelineService } from '../../services/timelineService';

interface WeatherTimelineBarProps {
  timelineItems: TimelineItem[];
  onItemPress: (index: number) => void;
  currentTime: Date;
}

export const WeatherTimelineBar: React.FC<WeatherTimelineBarProps> = ({
  timelineItems,
  onItemPress,
  currentTime,
}) => {
  // 1. Filtrer : On veut voir ce qui se passe dans les 24 prochaines heures
  // ET aussi les tâches en retard ("overdue") car c'est important
  const visibleItems = timelineItems.filter(item => {
    const diffHours = (item.scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

    // On garde les retards (diff négatif) et les événements futurs jusqu'à +24h
    // On retire les tâches complétées
    return (diffHours < 24) && item.status !== 'completed';
  });

  if (visibleItems.length === 0) {
    return (
      <View style={styles.emptyBar}>
        <Text style={styles.emptyText}>Rien à l'horizon pour les 24h à venir 💤</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Fil de la journée</Text>
        <Text style={styles.timeIndic}>{TimelineService.formatTime(currentTime)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleItems.map((item) => {
          const color = TimelineService.getStatusColor(item.status, item.isNextUpcoming);
          const time = TimelineService.formatTime(item.scheduledTime);

          // Calculer si c'est loin (pour l'UI, ex: opacité réduite si > 12h)
          const isFar = (item.scheduledTime.getTime() - currentTime.getTime()) > (12 * 60 * 60 * 1000);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.hourContainer, isFar && { opacity: 0.6 }]}
              onPress={() => {
                // Astuce : on doit retrouver le vrai index ou passer l'objet directement
                // Ici on passe l'index dans le tableau visible, attention à la correspondance dans le parent
                // Mieux vaut modifier le parent pour accepter l'objet Task, mais pour l'instant :
                const realIndex = timelineItems.findIndex(t => t.id === item.id);
                onItemPress(realIndex);
              }}
            >
              <View style={styles.lineConnector} />

              <View style={styles.timeBubble}>
                <Text style={styles.timeText}>{time}</Text>
              </View>

              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.icon}>{item.task.Icon}</Text>
                {/* Petit point rouge si retard */}
                {item.status === 'overdue' && <View style={styles.alertDot} />}
              </View>

              <Text style={styles.taskName} numberOfLines={1}>
                {item.task.Name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'baseline',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  timeIndic: {
    fontSize: 12,
    color: '#8E59FF',
    fontWeight: 'bold',
  },
  emptyBar: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyText: {
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  hourContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 65,
    position: 'relative',
  },
  lineConnector: {
    position: 'absolute',
    top: 25,
    left: -35,
    right: -35,
    height: 2,
    backgroundColor: '#f0f0f0',
    zIndex: -1,
    display: 'none', // Peut être activé pour faire une ligne continue
  },
  timeBubble: {
    backgroundColor: '#f7fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#718096',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
  },
  alertDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: 'white',
  },
  taskName: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
});