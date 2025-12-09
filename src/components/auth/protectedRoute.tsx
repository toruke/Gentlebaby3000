// import React from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { useAuthRedirect } from '../../hooks/useAuthRedirect';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// export default function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { loading } = useAuthRedirect(); // On va modifier le hook pour retourner un état loading

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007bff" />
//       </View>
//     );
//   }

//   return <>{children}</>;
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
// });