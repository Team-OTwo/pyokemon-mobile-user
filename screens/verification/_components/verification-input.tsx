import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthInput, DatePicker } from '@/components/auth';
import { VerificationStep, ValidationErrors } from '../types';

interface VerificationInputProps {
  step: VerificationStep;
  phoneNumber: string;
  name: string;
  birth: string;
  verificationCode: string;
  onPhoneNumberChange: (text: string) => void;
  onNameChange: (text: string) => void;
  onBirthChange: (date: any) => void;
  onVerificationCodeChange: (text: string) => void;
  errors: ValidationErrors;
  timeLeft: number;
  isTimerActive: boolean;
  onResendCode: () => void;
}

export const VerificationInput: React.FC<VerificationInputProps> = ({
  step,
  phoneNumber,
  name,
  birth,
  verificationCode,
  onPhoneNumberChange,
  onNameChange,
  onBirthChange,
  onVerificationCodeChange,
  errors,
  timeLeft,
  isTimerActive,
  onResendCode,
}) => {
  if (!step.hasInput) return null;

  return (
    <View style={styles.inputContainer}>
      {/* 기기변경용: 이름, 생년월일, 휴대폰번호 모두 입력 */}
      {step.inputType === 'full-verification' && (
        <>
          <AuthInput
            value={name}
            onChangeText={onNameChange}
            placeholder="이름"
            keyboardType="default"
            error={errors.name}
          />
          <DatePicker
            value={birth}
            onChange={onBirthChange}
            placeholder="생년월일"
            error={errors.birth}
          />
          <AuthInput
            value={phoneNumber}
            onChangeText={onPhoneNumberChange}
            placeholder="휴대폰 번호 (예: 010-9960-0464)"
            inputType="phone"
            error={errors.phoneNumber}
          />
        </>
      )}

      {/* 첫 기기등록용: 휴대폰번호만 입력 */}
      {step.inputType === 'phone-number' && (
        <>
          <AuthInput
            value={phoneNumber}
            onChangeText={onPhoneNumberChange}
            placeholder="휴대폰 번호 (예: 010-9960-0464)"
            inputType="phone"
            error={errors.phoneNumber}
          />
        </>
      )}

      {/* 인증번호 입력 */}
      {step.inputType === 'code' && (
        <>
          <AuthInput
            value={verificationCode}
            onChangeText={onVerificationCodeChange}
            placeholder="인증번호 6자리"
            keyboardType="numeric"
            error={errors.verificationCode}
          />
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {isTimerActive
                ? `남은 시간: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                    .toString()
                    .padStart(2, '0')}`
                : '시간 만료'}
            </Text>
            <TouchableOpacity
              onPress={onResendCode}
              disabled={isTimerActive}
              style={[
                styles.resendButton,
                isTimerActive && styles.resendButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  isTimerActive && styles.resendButtonTextDisabled,
                ]}
              >
                재발송
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#2E5BFF',
  },
  resendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
});
