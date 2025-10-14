import React from 'react';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  disabled = false, 
}: ButtonProps) {
  
  const baseStyle = 'items-center justify-center rounded-2xl';
  
  const variantStyles = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-purple-400 active:bg-purple-500',
    outline: 'bg-transparent border-2 border-blue-500 active:bg-blue-50',
    danger: 'bg-red-500 active:bg-red-600',
    soft: 'bg-pink-100 active:bg-pink-200',
  };
  
  const textVariantStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-blue-500 font-semibold',
    danger: 'text-white font-semibold',
    soft: 'text-pink-600 font-semibold',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };
  
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className={`${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
        {title}
      </Text>
    </Pressable>
  );
}
