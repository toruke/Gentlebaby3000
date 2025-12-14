import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// CORRECTION 1 : Importer 'Href'
import { useLocalSearchParams, useRouter, useGlobalSearchParams, Href } from 'expo-router';
import { useFamilyTasks } from '../../hooks/useFamilyTasks';
import { TaskFilters } from '../../components/activity/taskFilters';
import { TaskCard } from '../../components/activity/taskCard';

interface FamilyActivityScreenProps {
  familyId?: string;
}

export default function FamilyActivityScreen({
  familyId: propFamilyId,
}: FamilyActivityScreenProps = {}) {
  const router = useRouter();

  // Récupérez les params de toutes les sources possibles
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();


  // Essayez toutes les sources possibles dans l'ordre de priorité
  const familyId = (
    propFamilyId ||                // 1. Depuis les props
    localParams.familyId ||        // 2. Depuis les params locaux
    localParams.id ||              // 3. Autre clé possible
    globalParams.familyId ||       // 4. Depuis les params globaux
    globalParams.id                // 5. Autre clé globale
  );

  // Convertir en string si c'est un tableau
  const effectiveFamilyId = Array.isArray(familyId) ? familyId[0] : familyId;


  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Utilisez le hook avec l'ID
  const {
    tasks,
    loading,
    refreshing,
    error,
    refresh,
    deleteTask,
    toggleActive,
    markComplete,
  } = useFamilyTasks(effectiveFamilyId);

  // Debug supplémentaire
  useEffect(() => {
  }, [loading, tasks, error, effectiveFamilyId]);

  // Si pas d'ID, montrez un écran d'erreur clair
  if (!effectiveFamilyId || effectiveFamilyId === 'undefined') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>❌ ID de famille manquant</Text>
        <Text style={styles.errorText}>
          Impossible de charger les activités sans identifiant de famille.
        </Text>
        <Text style={styles.debugText}>
          ID reçu: {String(familyId)}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Écran de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8E59FF" />
        <Text style={styles.loadingText}>Chargement des activités...</Text>
      </View>
    );
  }

  // Écran d'erreur du hook
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>⚠️ Erreur de chargement</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    if (filterType !== 'all' && task.Type !== filterType) return false;
    if (filterStatus !== 'all' && task.Status !== filterStatus) return false;
    return true;
  });

  // Gestion des actions
  const handleDeleteTask = async (taskId: string, taskName: string) => {
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
              await deleteTask(taskId);
              Alert.alert('Succès', 'Tâche supprimée avec succès');
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer la tâche');
            }
          },
        },
      ],
    );
  };

  const handleToggleActive = async (taskId: string, currentActive: boolean) => {
    try {
      await toggleActive(taskId, currentActive);
      Alert.alert(
        'Succès',
        currentActive ? 'Tâche désactivée' : 'Tâche activée',
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      await markComplete(taskId);
      Alert.alert('Succès', 'Tâche validée');
    } catch {
      Alert.alert('Erreur', 'Impossible de valider la tâche');
    }
  };

  const handleEditTask = (taskId: string) => {
    // CORRECTION 2 : Ajouter 'as Href' à la fin de la chaîne
    router.push(`/family/${effectiveFamilyId}/task/${taskId}` as Href);
  };

  const handleCreateTask = () => {
    // CORRECTION 3 : Ajouter 'as Href' ici aussi
    router.push(`/family/${effectiveFamilyId}/task` as Href);
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>📋 Activités</Text>
          <Text style={styles.subtitle}>
            {tasks.length} tâche(s) • {filteredTasks.length} filtrée(s)
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateTask}
        >
          <Text style={styles.addButtonText}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <TaskFilters
        filterType={filterType}
        filterStatus={filterStatus}
        onTypeFilterChange={setFilterType}
        onStatusFilterChange={setFilterStatus}
      />

      {/* Liste des tâches */}
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onEdit={() => handleEditTask(item.id)}
            onToggleActive={handleToggleActive}
            onMarkComplete={handleMarkComplete}
            onDelete={handleDeleteTask}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredTasks.length === 0 && styles.emptyListContainer,
        ]}
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
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>Aucune activité pour le moment</Text>
            <Text style={styles.emptySubtext}>
              Créez votre première tâche pour commencer à suivre les activités
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={handleCreateTask}
            >
              <Text style={styles.createFirstButtonText}>Créer une activité</Text>
            </TouchableOpacity>
          </View>
        }
        ListHeaderComponent={
          filteredTasks.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {filteredTasks.length} activité(s) trouvée(s)
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
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
  addButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 10,
    shadowColor: '#8E59FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
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
    lineHeight: 22,
  },
  debugText: {
    fontSize: 12,
    color: '#a0aec0',
    fontFamily: 'monospace',
    marginBottom: 20,
    backgroundColor: '#f7fafc',
    padding: 8,
    borderRadius: 6,
  },
  backButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: '#8E59FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#8E59FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstButton: {
    backgroundColor: '#8E59FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: '#8E59FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});