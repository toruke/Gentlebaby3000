import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function ExampleScreen() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');

  return (
    <View>
      <TextInput
        testID="input"
        value={text}
        onChangeText={setText}
        placeholder="Type something"
      />

      <Button
        title="Submit"
        onPress={() => setSubmitted(text)}
      />

      {submitted !== '' && (
        <Text testID="result">{submitted}</Text>
      )}
    </View>
  );
}