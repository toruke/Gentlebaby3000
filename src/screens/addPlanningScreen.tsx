import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars'; // ✅ Ajout Type DateData
import { Button, Card } from 'react-native-paper'; // ❌ Divider retiré car inutile
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { PlanningSlot } from '../models/planning';
import { addPlanningService } from '../services/addPlanningService';

type DBFamilyMember = {
  id: string;
  displayName: string;
  role: string;
  userId: string;
};

export default function AddPlanningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawId = params.familyId || params.id;
  const familyId = typeof rawId === 'string' ? rawId : (Array.isArray(rawId) ? rawId[0] : '');

  const [loading, setLoading] = useState(true);
  const [planningSlots, setPlanningSlots] = useState<PlanningSlot[]>([]);
  const [members, setMembers] = useState<DBFamilyMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // ✅ Correction : slotDate était défini mais pas utilisé, on l'utilise ou on le retire
  // Ici je le garde pour l'affichage
  const [slotDate, setSlotDate] = useState(new Date()); 
  
  const [dateString, setDateString] = useState(formatDateForInput(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const [showCalendar, setShowCalendar] = useState(false);
  
  // ✅ Correction du type 'any' -> Record<string, { selected: boolean; selectedColor: string }>
  const [markedDates, setMarkedDates] = useState<Record<string, { selected: boolean; selectedColor: string }>>({});

  useEffect(() => {
    if (!familyId) {
      console.error('ERREUR: Pas d\'ID de famille');
      setLoading(false);
      return;
    }

    // ✅ Correction : loadData est déplacé DANS le useEffect pour éviter le warning de dépendance
    const loadData = async () => {
      try {
        setLoading(true);
        
        const slotsData = await addPlanningService.getPlanningSlots(familyId);
        setPlanningSlots(slotsData);
  
        const membersRef = collection(db, 'family', familyId, 'members');
        const snapshot = await getDocs(membersRef);
        
        const membersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || 'Sans Nom',
            role: data.role || 'membre',
            userId: data.userId,
          };
        }) as DBFamilyMember[];
  
        setMembers(membersData);
  
        if (membersData.length > 0) {
          setSelectedMemberId(membersData[0].id);
        }
  
      } catch (error) {
        console.error('Erreur chargement:', error);
        Alert.alert('Erreur', 'Problème lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [familyId]);

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateString(dateStr: string): Date | null {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  const createDateTime = (dateStr: string, timeStr: string): Date | null => {
    const date = parseDateString(dateStr);
    const [h, m] = timeStr.split(':').map(Number);
    if (!date || h === undefined) return null;
    date.setHours(h, m || 0, 0);
    return date;
  };

  const addPlanningSlot = async () => {
    if (!selectedMemberId) {
      Alert.alert('Erreur', 'Sélectionnez un membre');
      return;
    }

    const startDateTime = createDateTime(dateString, startTime);
    const endDateTime = createDateTime(dateString, endTime);

    if (!startDateTime || !endDateTime || startDateTime >= endDateTime) {
      Alert.alert('Erreur', 'Heures invalides');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const nameParts = member.displayName.split(' ');
    const firstName = nameParts[0] || member.displayName;
    const lastName = nameParts.slice(1).join(' ') || ''; 

    try {
      await addPlanningService.addPlanningSlot(
        familyId,
        member.id,
        firstName,
        lastName,
        startDateTime,
        endDateTime,
      );

      const newSlots = await addPlanningService.getPlanningSlots(familyId);
      setPlanningSlots(newSlots);
      setModalVisible(false);
      Alert.alert('Succès', 'Créneau ajouté');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Echec de l\'ajout');
    }
  };

  // ✅ Correction du type 'any' -> DateData (Type fourni par la librairie)
  const handleDateSelect = (day: DateData) => {
    const d = parseDateString(day.dateString);
    if(d) { 
      setSlotDate(d); 
      setDateString(day.dateString); 
      setShowCalendar(false); 
      // Utilisation de setMarkedDates pour enlever le warning "assigned but never used"
      setMarkedDates({ [day.dateString]: { selected: true, selectedColor: '#6C63FF' } });
    }
  };

  if (loading) return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" color="#6C63FF"/>
      <Text>Chargement des membres...</Text>
    </View>
  );

  if (!familyId) return (
    <View style={{padding:20, alignItems:'center'}}>
      <Text style={{color:'red'}}>Erreur: ID Famille manquant</Text>
      <Button onPress={()=>router.back()}>Retour</Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
        <TouchableOpacity onPress={()=>router.back()}><Text style={{fontSize:18, color:'#6C63FF', marginRight:10}}>← Retour</Text></TouchableOpacity>
        <Text style={{fontSize:20, fontWeight:'bold'}}>Planning</Text>
      </View>

      <Button mode="contained" onPress={() => setModalVisible(true)} style={{marginBottom:15, backgroundColor:'#6C63FF'}}>
        + Ajouter Créneau
      </Button>

      <FlatList
        data={planningSlots}
        keyExtractor={item => item.planningId}
        renderItem={({ item }) => (
          <Card style={{marginBottom:10, backgroundColor:'white'}}>
            <Card.Title title={`${item.firstName} ${item.lastName}`} subtitle="Garde enfant" />
            <Card.Content>
              <Text style={{color:'#6C63FF', fontWeight:'bold'}}>
                {/* ✅ Utilisation de slotDate quelque part ou affichage direct */}
                {item.startTime.toLocaleDateString()}
              </Text>
              <Text>
                {item.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {item.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20, color:'#999'}}>Aucun créneau.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nouveau Créneau</Text>
              
              <Text style={styles.label}>Date : {slotDate.toLocaleDateString()}</Text>
              <TouchableOpacity onPress={()=>setShowCalendar(!showCalendar)} style={styles.input}>
                <Text>{dateString}</Text>
              </TouchableOpacity>
              
              {/* ✅ Utilisation de markedDates */}
              {showCalendar && <Calendar onDayPress={handleDateSelect} markedDates={markedDates} />}

              <View style={{flexDirection:'row', gap:10}}>
                <View style={{flex:1}}>
                  <Text style={styles.label}>Début</Text>
                  <RNTextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="09:00"/>
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.label}>Fin</Text>
                  <RNTextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="10:00"/>
                </View>
              </View>

              <Text style={styles.label}>Membre</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedMemberId} onValueChange={setSelectedMemberId}>
                  {members.map(m => (
                    <Picker.Item key={m.id} label={m.displayName} value={m.id} />
                  ))}
                </Picker>
              </View>

              <Button mode="contained" onPress={addPlanningSlot} style={{marginTop:20, backgroundColor:'#6C63FF'}}>Valider</Button>
              <Button onPress={()=>setModalVisible(false)} style={{marginTop:10}}>Annuler</Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FE' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign:'center' },
  label: { fontSize: 12, color: '#666', marginTop: 10, marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 8 },
  pickerBox: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, marginTop: 5 },
});
