import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect, useRef } from 'react';

interface ToggleSwitchProps {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export default function ToggleSwitch({
  title,
  value,
  onValueChange,
  description,
}: ToggleSwitchProps) {
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#FFFFFF' },
    'background',
  );
  const textColor = useThemeColor(
    { light: '#000000', dark: '#FFFFFF' },
    'text',
  );
  const secondaryTextColor = useThemeColor(
    { light: '#8E8E93', dark: '#8E8E93' },
    'text',
  );

  const thumbPosition = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(thumbPosition, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [value, thumbPosition]);

  const handleToggle = () => {
    onValueChange(!value);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {title}
        </ThemedText>
        {description && (
          <ThemedText
            style={[styles.description, { color: secondaryTextColor }]}
          >
            {description}
          </ThemedText>
        )}
      </View>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
        <View
          style={[
            styles.toggleContainer,
            value && styles.toggleContainerActive,
          ]}
        >
          <Animated.View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: thumbPosition }] },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
  },
  toggleContainer: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E5E5EA',
    padding: 2,
    justifyContent: 'center',
  },
  toggleContainerActive: {
    backgroundColor: '#34C759',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});
