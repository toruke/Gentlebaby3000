import { useEffect, useState } from 'react';
import { Notification } from '../models/notification';
import {
  fetchFamilyNotifications,
  markNotificationAsRead,
} from '../services/notificationService';

/**
 * Hook de gestion des notifications d'une famille
 */
export const useNotifications = (familyId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await fetchFamilyNotifications(familyId);
    setNotifications(data as Notification[]);
    setLoading(false);
  };

  const unreadCount = notifications.filter(
    n => n.status === 'unread',
  ).length;

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n =>
        n.notificationId === id
          ? { ...n, status: 'read' }
          : n,
      ),
    );
  };

  useEffect(() => {
    if (!familyId) return;
    loadNotifications();
  }, [familyId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: loadNotifications,
  };
};
