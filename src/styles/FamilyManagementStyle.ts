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
  text:{
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20,
    textAlign:'center',
    fontWeight: 'bold',
  },
  roleItem: {
    backgroundColor: '#f7fafc',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    color: '#6b46c1',
    textAlign: 'center',
  },
});