import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  disabled?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  disabled = false,
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-gray-700 font-semibold mb-2 text-sm">
          {label}
        </Text>
      )}
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={!disabled}
        className={`
          bg-white 
          border-2 
          ${error ? 'border-red-400' : 'border-gray-200'} 
          rounded-2xl 
          px-4 
          py-3 
          text-gray-800 
          text-base
          ${multiline ? 'h-24' : ''}
          ${disabled ? 'bg-gray-100 opacity-50' : ''}
        `}
        placeholderTextColor="#9CA3AF"
      />
      
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
