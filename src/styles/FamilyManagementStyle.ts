import { StyleSheet } from 'react-native';

export const stylesFamily = StyleSheet.create({
  loading:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38,
  },
  error:{
    color: 'red',
  },
  multipleFamily: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    margin: 10,
  },
});