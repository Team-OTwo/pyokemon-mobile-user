import React from 'react';
import { View, ViewStyle } from 'react-native';

interface TabBarBackgroundProps {
  style?: ViewStyle;
}

export default function TabBarBackground({ style }: TabBarBackgroundProps) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
        style,
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
