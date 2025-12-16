import { Ionicons } from '@expo/vector-icons';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import '../global.css';
import BackgroundShapes from '../src/components/backgroundShapes';
import LoadingScreen from '../src/components/loadingScreen';
import NotificationBell from '../src/components/notifications/NotificationBell';
import { useAuthRedirect } from '../src/hooks/useAuthRedirect';
import { useNotifications } from '../src/hooks/useNotifications';

export default function RootLayout() {
  const { isLoading } = useAuthRedirect();
  const router = useRouter();

  // 🔑 Récupération des paramètres globaux (familyId / id)
  const { familyId, id } = useGlobalSearchParams();

  // 🔁 Normalisation de l’ID famille
  const effectiveFamilyId = Array.isArray(familyId)
    ? familyId[0]
    : familyId || (Array.isArray(id) ? id[0] : id);

  // ✅ Notifications (inchangé côté logique)
  const { unreadCount } = useNotifications(
    typeof effectiveFamilyId === 'string' ? effectiveFamilyId : undefined,
  );

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <BackgroundShapes style={styles.background} />

      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: 'transparent' },

            // 🔔 AJOUT UNIQUEMENT DE LA CLOCHE (sans toucher au reste)
            headerRight: () =>
              effectiveFamilyId ? (
                <View style={styles.headerRight}>
                  {/* ⚙️ PARAMÈTRES */}
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('./')}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={24}
                      color="#6b7280"
                    />
                  </TouchableOpacity>

                  {/* 🔔 NOTIFICATIONS */}
                  <NotificationBell
                    unreadCount={unreadCount}

                    onPress={() =>
                      router.push(
                        `/notifications?familyId=${effectiveFamilyId}`,
                      )
                    }
                  />
                </View>
              ) : null,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Bienvenue',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="auth/login/index"
            options={{
              title: 'Connexion',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />

          <Stack.Screen
            name="auth/signup/index"
            options={{
              title: 'Inscription',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />
          <Stack.Screen
            name="user/EditingProfileUser"
            options={{
              title: 'Modification de mon profil utilisateur',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerTintColor: '#1e293b',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  stackContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
  },

  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 2,
  },
});
