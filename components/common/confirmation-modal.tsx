import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import {ThemedView} from './themed-view';
import {ThemedText} from './themed-text';
import {useThemeColor} from '../../hooks/useThemeColor';

const {width: screenWidth} = Dimensions.get('window');

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'default' | 'danger' | 'warning';
  showCancel?: boolean;
}

export interface AlertModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'default' | 'danger' | 'warning';
  showCancel?: boolean;
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
  showCancel = true,
}: ConfirmationModalProps) {
  const tintColor = useThemeColor({light: '#75B8FF', dark: '#fff'}, 'tint');

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
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.content}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.8}>
                <ThemedText style={styles.cancelButtonText}>
                  {cancelText}
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {backgroundColor: typeColors.confirmBg},
                !showCancel && styles.singleButton, // 취소 버튼이 없을 때 전체 너비 사용
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}>
              <ThemedText
                style={[
                  styles.confirmButtonText,
                  {color: typeColors.confirmText},
                ]}>
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
  },
  modalContainer: {
    width: screenWidth - 40,
    borderRadius: 10,
    padding: 24,
    marginBottom: 100,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F1F3',
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
  singleButton: {
    flex: 1,
  },
});

// Alert.alert 형태의 함수들 - 커스텀 모달 디자인 사용
let modalState: {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type: 'default' | 'danger' | 'warning';
  showCancel: boolean;
} = {
  visible: false,
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  type: 'default',
  showCancel: false,
};

let modalListeners: Array<(state: typeof modalState) => void> = [];

export function showAlert({
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'default',
  showCancel = false,
}: AlertModalProps) {
  modalState = {
    visible: true,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    type,
    showCancel,
  };

  // 모든 리스너에게 상태 변경 알림
  modalListeners.forEach(listener => listener(modalState));
}

export function hideAlert() {
  modalState = {
    ...modalState,
    visible: false,
  };

  modalListeners.forEach(listener => listener(modalState));
}

export function subscribeToAlertModal(
  listener: (state: typeof modalState) => void,
) {
  modalListeners.push(listener);

  return () => {
    modalListeners = modalListeners.filter(l => l !== listener);
  };
}

export function getAlertModalState() {
  return modalState;
}

// 전역 Alert 모달 컴포넌트
export function GlobalAlertModal() {
  const [state, setState] = React.useState(modalState);

  React.useEffect(() => {
    const unsubscribe = subscribeToAlertModal(setState);
    return unsubscribe;
  }, []);

  const handleConfirm = () => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (state.onCancel) {
      state.onCancel();
    }
    hideAlert();
  };

  return (
    <ConfirmationModal
      visible={state.visible}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      onConfirm={handleConfirm}
      onCancel={state.showCancel ? handleCancel : hideAlert}
      type={state.type}
      showCancel={state.showCancel}
    />
  );
}

// 편의 함수들 - Alert.alert 형태 (확인 버튼만)
export function showSuccessAlert(
  title: string,
  message: string,
  onConfirm?: () => void,
) {
  showAlert({
    title,
    message,
    confirmText: '확인',
    onConfirm,
    type: 'default',
    showCancel: false, // 확인 버튼만 표시
  });
}

export function showErrorAlert(
  title: string,
  message: string,
  onConfirm?: () => void,
) {
  showAlert({
    title,
    message,
    confirmText: '확인',
    onConfirm,
    type: 'danger',
    showCancel: false, // 확인 버튼만 표시
  });
}

export function showWarningAlert(
  title: string,
  message: string,
  onConfirm?: () => void,
) {
  showAlert({
    title,
    message,
    confirmText: '확인',
    onConfirm,
    type: 'warning',
    showCancel: false, // 확인 버튼만 표시
  });
}

// 확인/취소 버튼이 있는 Alert (Alert.alert의 두 번째 형태)
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm?: () => void,
  onCancel?: () => void,
  confirmText = '확인',
  cancelText = '취소',
  type: 'default' | 'danger' | 'warning' = 'default',
) {
  showAlert({
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    type,
    showCancel: true, // 취소 버튼도 표시
  });
}
