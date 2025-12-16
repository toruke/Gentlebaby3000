import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';


export default function NotificationsScreen() {
  const router = useRouter();
  const { familyId } = useLocalSearchParams();

  // 🔁 Normalisation familyId
  const effectiveFamilyId = Array.isArray(familyId)
    ? familyId[0]
    : familyId;

  const {
    notifications,
    loading,
    markAsRead,
  } = useNotifications(effectiveFamilyId);

  // ⏳ Chargement
  if (loading) {
    return <Text style={styles.loading}>Chargement…</Text>;
  }

  // 📭 Aucune notification
  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune notification</Text>
      </View>
    );
  }

    type NotificationItem = {
        notificationId: string;
        status: 'unread' | 'read' | string;
        title: string;
        message: string;
        type: string;
        sourceId?: string;
    };

    const handlePress = async (notif: NotificationItem) => {
      await markAsRead(notif.notificationId);
      // Navigation selon le type

      switch (notif.type) {
      case 'task_start':
      case 'task_late':
        router.push({
          pathname: '/family/[id]/task',
          params: {
            id: effectiveFamilyId,
            taskId: notif.sourceId,
          },
        });
        break;

      case 'new_member':
        router.push({
          pathname: '/family/[id]',
          params: { id: effectiveFamilyId },
        });
        break;

      case 'shift_start':
        router.push({
          pathname: '/family/[id]/planning',
          params: { id: effectiveFamilyId },
        });
        break;

      case 'babyphone_noise':
        router.push({
          pathname: '/family/[id]/device',
          params: { id: effectiveFamilyId },
        });
        break;

      default:
        // fallback : rester sur la page notifications
        break;
      }






    };

    return (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notificationId}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.status === 'unread' && styles.unreadCard,
            ]}
            onPress={() => handlePress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>

              {item.status === 'unread' && (
                <View style={styles.unreadDot} />
              )}
            </View>

            <Text style={styles.message}>{item.message}</Text>
          </TouchableOpacity>
        )}
      />
    );
}

/* ===========================
          STYLES
=========================== */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8E59FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1f2937',
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E59FF',
  },
});
