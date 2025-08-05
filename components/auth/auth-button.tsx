import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

export interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  isPrimary?: boolean;
  disabled?: boolean;
}

export function AuthButton({
  title,
  onPress,
  isLoading = false,
  isPrimary = true,
  disabled = false,
  ...props
}: AuthButtonProps) {
  const tintColor = useThemeColor(
    { light: '#75B8FF', dark: '#2E5BFF' },
    'tint',
  );
  const textColor = useThemeColor(
    { light: '#FFFFFF', dark: '#FFFFFF' },
    'text',
  );
  const secondaryBgColor = useThemeColor(
    { light: '#F5F7FA', dark: '#2C3235' },
    'background',
  );
  const secondaryTextColor = useThemeColor(
    { light: '#2E5BFF', dark: '#2E5BFF' },
    'text',
  );

  const buttonStyle = [
    styles.button,
    isPrimary
      ? { backgroundColor: tintColor }
      : { backgroundColor: secondaryBgColor },
    disabled && styles.disabledButton,
  ];

  const textStyle = [
    styles.text,
    isPrimary ? { color: textColor } : { color: secondaryTextColor },
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? textColor : tintColor} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});
