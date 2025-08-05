import React from 'react';
import { View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export default function IconSymbol({ name, size = 24, color = '#000', style }: IconSymbolProps) {
  return (
    <View style={style}>
      <Icon name={name as any} size={size} color={color} />
    </View>
  );
}
