import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFamilyTimeline } from '../../hooks/useFamilyTimeline';
import { WeatherTimelineBar } from '../../components/timeline/weatherTimelineBar';
import { TimelineItemCard } from '../../components/timeline/timelineItemCard';
import { TimelineService } from '../../services/timelineService';
import { Task } from '../../models/task';

export default function PlanningScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const familyId = localParams.familyId as string;
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toleranceMinutes, setToleranceMinutes] = useState(15);

  const {
    timeline,
    groupedTimeline,
    loading,
    refreshing,
    error,
    refresh,
    currentTime,
  } = useFamilyTimeline(familyId, toleranceMinutes);

  // Gestion des erreurs
  if (!familyId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>ID de famille manquant</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8E59FF" />
        <Text style={styles.loadingText}>Chargement de la timeline...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Erreur de chargement</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Gestion du clic sur une tâche
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleWeatherItemPress = (index: number) => {
    if (timeline[index]) {
      handleTaskPress(timeline[index].task);
    }
  };

  // Formater les données pour FlatList
  const sections = Object.entries(groupedTimeline).map(([period, items]) => ({
    period,
    label: TimelineService.getPeriodLabel(period as never),
    data: items,
  }));

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📅 Vue temporelle</Text>
          <Text style={styles.subtitle}>
            {timeline.length} événement(s) à venir • {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => Alert.alert(
            'Configuration',
            'Modifier la tolérance (minutes) :',
            [
              { text: '10 min', onPress: () => setToleranceMinutes(10) },
              { text: '15 min', onPress: () => setToleranceMinutes(15) },
              { text: '30 min', onPress: () => setToleranceMinutes(30) },
              { text: 'Annuler', style: 'cancel' },
            ],
          )}
        >
          <Text style={styles.settingsButtonText}>⚙️ {toleranceMinutes}min</Text>
        </TouchableOpacity>
      </View>

      {/* Barre météo */}
      <WeatherTimelineBar
        timelineItems={timeline}
        onItemPress={handleWeatherItemPress}
        currentTime={currentTime}
      />

      {/* Timeline principale */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.period}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.label}</Text>
              <Text style={styles.sectionCount}>{item.data.length} événement(s)</Text>
            </View>
            {item.data.map((timelineItem) => (
              <TimelineItemCard
                key={timelineItem.id}
                item={timelineItem}
                onPress={handleTaskPress}
                toleranceMinutes={toleranceMinutes}
              />
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            colors={['#8E59FF']}
            tintColor="#8E59FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Aucun événement à venir</Text>
            <Text style={styles.emptySubtext}>
              Les événements à venir apparaîtront ici automatiquement
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal de détails de la tâche */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedTask && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>{selectedTask.Icon}</Text>
                  <Text style={styles.modalTitle}>{selectedTask.Name}</Text>
                </View>

                <View style={styles.modalDetails}>
                  <DetailRow icon="📋" label="Type" value={
                    selectedTask.Type === 'recurring' ? 'Récurrente' :
                      selectedTask.Type === 'temporal' ? 'Temporelle' : 'Événement'
                  } />
                  
                  <DetailRow icon="👥" label="Assigné à" 
                    value={`${selectedTask.assignedMembers?.length || 0} membre(s)`} />
                  
                  <DetailRow icon="⏱️" label="Tolérance" 
                    value={`${selectedTask.Tolerance || toleranceMinutes} minutes`} />
                  
                  <DetailRow icon="📅" label="Prochaine occurrence" 
                    value={selectedTask.nextOccurrence 
                      ? new Date(selectedTask.nextOccurrence).toLocaleString('fr-FR')
                      : 'Non définie'
                    } />
                  
                  {selectedTask.fixedTimes && selectedTask.fixedTimes.length > 0 && (
                    <DetailRow icon="🕐" label="Heures fixes" 
                      value={selectedTask.fixedTimes.join(', ')} />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Composant auxiliaire pour les détails
const DetailRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  settingsButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  settingsButtonText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
  },
  sectionCount: {
    fontSize: 12,
    color: '#a0aec0',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});