import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks';
import { Text } from 'react-native-gesture-handler';

interface BadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({ count, size = 'medium' }) => {
  const backgroundColor = useThemeColor(
    { light: '#FF3B30', dark: '#FF453A' },
    'tint',
  );
  const textColor = '#ffffff';

  if (count <= 0) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { height: 15, borderRadius: 8, paddingHorizontal: 5 },
          text: { fontSize: 10, fontWeight: 'bold' },
        };
      case 'large':
        return {
          container: { width: 24, height: 24, borderRadius: 12 },
          text: { fontSize: 14 },
        };
      default: // medium
        return {
          container: { width: 20, height: 20, borderRadius: 10 },
          text: { fontSize: 12 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.badge, sizeStyles.container, { backgroundColor }]}>
      <Text style={{ color: textColor, fontSize: 10, fontWeight: 'bold' }}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
