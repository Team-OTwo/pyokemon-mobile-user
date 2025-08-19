import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'default' | 'danger' | 'warning';
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'default',
}: ConfirmationModalProps) {
  const tintColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirmBg: '#FF3B30',
          confirmText: '#FFFFFF',
        };
      case 'warning':
        return {
          confirmBg: '#FF9500',
          confirmText: '#FFFFFF',
        };
      default:
        return {
          confirmBg: tintColor,
          confirmText: '#FFFFFF',
        };
    }
  };

  const typeColors = getTypeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.content}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.cancelButtonText}>
                {cancelText}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: typeColors.confirmBg },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.confirmButtonText,
                  { color: typeColors.confirmText },
                ]}
              >
                {confirmText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: screenWidth - 40,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  confirmButton: {
    // backgroundColor는 동적으로 설정됨
  },
  cancelButtonText: {
    fontWeight: '600',
    opacity: 0.8,
  },
  confirmButtonText: {
    fontWeight: '600',
  },
});
