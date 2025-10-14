import Button from '@/components/Button';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function InviteGeneral() {
  return (
    <View style={styles.container}> {/* Your content here */}
      <Button title="caca" onPress={()=>{}}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
