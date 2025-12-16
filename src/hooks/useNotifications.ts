import { useCallback, useEffect, useState } from 'react';
import { Notification } from '../models/notification';
import {
  fetchFamilyNotifications,
  markNotificationAsRead,
} from '../services/notificationService';

export const useNotifications = (familyId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await fetchFamilyNotifications(familyId);
    setNotifications(data as Notification[]);
    setLoading(false);
  }, [familyId]);

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
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: loadNotifications,
  };
};
