import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthButton } from '@/components/auth';
import { VerificationStep } from '../types';

interface VerificationButtonProps {
  currentStep: number;
  totalSteps: number;
  currentStepData: VerificationStep;
  onPress: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  canGoBack?: boolean;
}

export const VerificationButton: React.FC<VerificationButtonProps> = ({
  currentStep,
  totalSteps,
  currentStepData,
  onPress,
  isLoading = false,
}) => {
  if (currentStep === 0) {
    return (
      <View style={styles.buttonContainer}>
        <AuthButton
          title="본인인증 시작하기"
          onPress={onPress}
          isLoading={isLoading}
        />
      </View>
    );
  }

  if (currentStep === totalSteps - 1) {
    return (
      <View style={styles.buttonContainer}>
        <AuthButton title="홈으로 이동하기" onPress={onPress} />
      </View>
    );
  }

  if (currentStepData.hasInput) {
    return (
      <View style={styles.buttonContainer}>
        <AuthButton
          title={currentStepData.buttonText || ''}
          onPress={onPress}
          isLoading={isLoading}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  backButtonContainer: {
    marginBottom: 12,
  },
});
