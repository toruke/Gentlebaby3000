import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationBellProps {
    unreadCount?: number;
    onPress: () => void;
}

export default function NotificationBell({
  unreadCount = 0,
  onPress,
}: NotificationBellProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* 🔔 Cloche PLUS GRANDE */}
      <Ionicons
        name="notifications-outline"
        size={26}
        color="#6B7280"
      />

      {/* 🔴 Badge */}
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* ===========================
                  CONTENEUR CLOCHE
              =========================== */
  container: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 0,   // ✅ POUSSE LA CLOCHE À DROITE (clé principale)
    marginRight: 0,   // ✅ colle au bord droit du header
  },

  /* ===========================
                      BADGE ROUGE
                 =========================== */
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,        // ✅ badge bien visible même au bord
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
    textAlign: 'center',
  },
});
