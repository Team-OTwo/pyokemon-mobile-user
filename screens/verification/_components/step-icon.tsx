import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIconProps {
  icon: string;
  tintColor: string;
}

export const StepIcon: React.FC<StepIconProps> = ({ icon, tintColor }) => {
  const getIconEmoji = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      'verified-user': '👤',
      'phone-android': '📱',
      sms: '📨',
      'check-circle': '✅',
    };
    return iconMap[iconName] || '👤';
  };

  return (
    <View style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
      <Text style={[styles.iconText, { color: tintColor }]}>
        {getIconEmoji(icon)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 60,
    textAlign: 'center',
  },
});
