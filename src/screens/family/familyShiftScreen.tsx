// src/screens/GuardPlanningScreen.tsx
import { useLocalSearchParams } from 'expo-router'; // 👈 Import essentiel pour Expo Router
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlanningSlot } from '../../models/planning';
import { getPlanningSlots } from '../../services/planning';
import { PlanningMode, getRangeForMode } from '../../utils/planningRange';
// import { useAuth } from '../../context/AuthContext'; // 👈 Décommente si tu as un contexte d'auth

const COLORS = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  background: '#F8F9FE',
  cardBg: '#FFFFFF',
  textDark: '#2D3436',
  textLight: '#A4B0BE',
  accent: '#E1E8FF',
};

type FamilyMember = {
  memberId: string;
  firstName: string;
  lastName: string;
};

// ❌ On supprime "Props" car le Router n'envoie pas de props directement
// type Props = { ... };

// ✅ On retire "export" ici pour le mettre en default à la fin
const GuardPlanningScreen: React.FC = () => {
  // 1. Récupération de l'ID via l'URL
  const localParams = useLocalSearchParams();
  const familyId = typeof localParams.id === 'string' ? localParams.id : '';

  // 2. Récupération des données utilisateur/membres
  // ⚠️ TODO: Remplace ceci par ton vrai hook de contexte (ex: useAuth() ou useFamily())
  // Pour l'instant, je mets des valeurs par défaut pour éviter le crash
  const [familyMembers] = useState<FamilyMember[]>([]);

  // Optionnel : Charger les membres si tu n'as pas de contexte global
  /*
  useEffect(() => {
     if(familyId) {
        // Appeler un service pour charger les membres de la famille
        // getFamilyMembers(familyId).then(setFamilyMembers);
     }
  }, [familyId]);
  */

  const [mode, setMode] = useState<PlanningMode>('24H');
  const [selectedDate] = useState<Date>(new Date());
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [slots, setSlots] = useState<PlanningSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMemberId(undefined);
  }, [familyId]);

  const loadSlots = useCallback(async () => {
    if (!familyId) return; // Sécurité si l'ID n'est pas encore chargé

    try {
      setLoading(true);
      setError(null);
      const { from, to } = getRangeForMode(mode, selectedDate);
      const result = await getPlanningSlots({
        familyId,
        from,
        to,
        memberId: selectedMemberId,
      });
      setSlots(result);
    } catch (e: unknown) {
      console.error('ERREUR:', e);
      setError('Erreur : ' + (e instanceof Error ? e.message : 'Inconnue'));
    } finally {
      setLoading(false);
    }
  }, [familyId, mode, selectedDate, selectedMemberId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const renderModeButton = (label: string, value: PlanningMode) => {
    const isSelected = mode === value;
    return (
      <TouchableOpacity
        onPress={() => setMode(value)}
        style={[styles.modeButton, isSelected && styles.modeButtonSelected]}
      >
        <Text style={[styles.modeText, isSelected && styles.modeTextSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderMemberFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        onPress={() => setSelectedMemberId(undefined)}
        style={[styles.avatarChip, !selectedMemberId && styles.avatarChipSelected]}
      >
        <Text style={[styles.avatarText, !selectedMemberId && styles.avatarTextSelected]}>Tous</Text>
      </TouchableOpacity>
      {/* On vérifie que familyMembers existe avant de map */}
      {familyMembers && familyMembers.map((m) => (
        <TouchableOpacity
          key={m.memberId}
          onPress={() => setSelectedMemberId(m.memberId)}
          style={[styles.avatarChip, selectedMemberId === m.memberId && styles.avatarChipSelected]}
        >
          <Text style={[styles.avatarText, selectedMemberId === m.memberId && styles.avatarTextSelected]}>
            {m.firstName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: PlanningSlot, index: number }) => {
    const start = item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const name = `${item.firstName || ''} ${item.lastName || ''}`;

    const currentDay = item.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const prevItem = slots[index - 1];
    const prevDay = prevItem ? prevItem.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : null;

    const showDayHeader = currentDay !== prevDay;
    const capitalizedDay = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

    return (
      <View>
        {showDayHeader && (
          <View style={styles.dayHeaderContainer}>
            <Text style={styles.dayHeaderText}>{capitalizedDay}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{start}</Text>
              <Text style={styles.timeSeparator}>↓</Text>
              <Text style={styles.timeText}>{end}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.memberName}>{name}</Text>
              <Text style={styles.roleText}>Garde bébé</Text>
              <Text style={styles.cardMiniDate}>{capitalizedDay}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={[styles.actionButton, styles.btnFilled]}>
              <Text style={styles.btnTextFilled}>Mode Relais</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning de garde</Text>
        <Text style={styles.subtitle}>
          {selectedDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          {renderModeButton('24H', '24H')}
          {renderModeButton('Jour', 'DAY')}
          {renderModeButton('Semaine', 'WEEK')}
        </View>
        {renderMemberFilter()}
      </View>

      {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && slots.length === 0 && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>💤 Aucun créneau planifié</Text>
        </View>
      )}

      <FlatList
        data={slots}
        keyExtractor={(item) => item.planningId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => { }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

// ... (Garder les styles tels quels)
const styles = StyleSheet.create({
  // --- STYLES GLOBAUX ---
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textDark },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4, textTransform: 'capitalize' },

  // --- CONTROLES ---
  controls: { paddingHorizontal: 20, marginBottom: 10 },
  modeSelector: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 12, padding: 4, marginBottom: 15 },
  modeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  modeButtonSelected: { backgroundColor: COLORS.cardBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  modeText: { fontWeight: '600', color: COLORS.textLight },
  modeTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  avatarChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  avatarText: { fontWeight: '600', color: COLORS.textDark },
  avatarTextSelected: { color: '#FFF' },

  // --- LISTE & ETATS ---
  listContent: { padding: 20, paddingBottom: 100 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },

  // --- NOUVEAU : EN-TETE DE JOUR ---
  dayHeaderContainer: {
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  dayHeaderText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // --- CARTE ---
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#FFF0F3',
    padding: 10,
    borderRadius: 12,
    minWidth: 80,
  },
  timeText: {
    fontWeight: 'bold',
    color: COLORS.textDark,
    fontSize: 15,
  },
  timeSeparator: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  infoContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  roleText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  cardMiniDate: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: { borderWidth: 1, borderColor: COLORS.primary },
  btnFilled: { backgroundColor: COLORS.primary },
  btnTextOutline: { color: COLORS.primary, fontWeight: '600' },
  btnTextFilled: { color: '#FFF', fontWeight: '600' },

  // --- BOUTON FLOTTANT (FAB) ---
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFF',
    marginTop: -4,
  },
});

// ✅ EXPORT PAR DÉFAUT (Crucial pour ton router)
export default GuardPlanningScreen;