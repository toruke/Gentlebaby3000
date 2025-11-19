import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSegments } from 'expo-router';
import { auth } from '../../config/firebaseConfig';

export function useAuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      
      const inAuthGroup = segments[0] === 'auth';
      const isWelcomeScreen = segments[0] === undefined;

      if (user) {
        // Utilisateur connecté
        if (inAuthGroup || isWelcomeScreen) {
          // Rediriger vers les tabs si on est sur l'auth ou la page d'accueil
          router.replace('/(tabs)');
        }
      } else {
        // Utilisateur non connecté
        if (!inAuthGroup && !isWelcomeScreen) {
          // Rediriger vers la page de bienvenue si on n'est pas dans l'auth
          router.replace('/');
        }
      }
    });

    return unsubscribe;
  }, [segments, router]);

  return { isLoading };
}