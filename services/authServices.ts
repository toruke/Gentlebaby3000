// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCurrentUser = async () => {
  const token = await AsyncStorage.getItem('token');
  return token ? { token } : null;
};
