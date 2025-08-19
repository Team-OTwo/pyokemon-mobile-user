import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ConfirmationModal } from './confirmation-modal';

export function ConfirmationModalDemo() {
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleConfirm = () => {
    console.log('사용자가 확인했습니다');
    setShowDefaultModal(false);
    setShowDangerModal(false);
    setShowWarningModal(false);
  };

  const handleCancel = () => {
    console.log('사용자가 취소했습니다');
    setShowDefaultModal(false);
    setShowDangerModal(false);
    setShowWarningModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        확인 모달 데모
      </ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => setShowDefaultModal(true)}
        >
          <ThemedText style={styles.buttonText}>기본 모달 열기</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.dangerButton]}
          onPress={() => setShowDangerModal(true)}
        >
          <ThemedText style={styles.buttonText}>위험 모달 열기</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.warningButton]}
          onPress={() => setShowWarningModal(true)}
        >
          <ThemedText style={styles.buttonText}>경고 모달 열기</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 기본 모달 */}
      <ConfirmationModal
        visible={showDefaultModal}
        title="기본 확인"
        message="이 작업을 진행하시겠습니까?"
        confirmText="진행"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type="default"
      />

      {/* 위험 모달 */}
      <ConfirmationModal
        visible={showDangerModal}
        title="삭제 확인"
        message="이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type="danger"
      />

      {/* 경고 모달 */}
      <ConfirmationModal
        visible={showWarningModal}
        title="경고"
        message="이 작업은 시스템에 영향을 줄 수 있습니다. 계속하시겠습니까?"
        confirmText="계속"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type="warning"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  demoButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
