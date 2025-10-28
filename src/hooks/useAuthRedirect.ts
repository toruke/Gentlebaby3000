/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

const PUBLIC_ROUTES = ['/', '/auth/login/index', '/auth/signup/index'];
const PROTECTED_ROUTES = ['/(tabs)', '/family/tutor-registration/index', '/auth/profile/index'];

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname.startsWith(route),
      );

      if (user) {
        // Utilisateur connecté → redirige depuis les pages publiques
        if (isPublicRoute) {
          console.log('🔐 Utilisateur connecté, redirection depuis:', pathname);
          router.replace('/(tabs)');
        }
      } else {
        // Utilisateur NON connecté → redirige depuis les pages protégées
        if (isProtectedRoute) {
          console.log('🚫 Utilisateur non connecté, redirection depuis:', pathname);
          router.replace('/');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return { loading };
}