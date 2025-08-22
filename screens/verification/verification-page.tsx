import { ThemedText, ThemedView } from '@/components/common';
import useAuth from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  deleteUserDevice,
  registerDevice,
  verifyUser,
} from '@/services/apis/account';
import { AuthStackParamList } from '@/types/navigation';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  ProgressIndicator,
  StepIcon,
  VerificationInput,
  VerificationButton,
} from './_components';
import {
  VERIFICATION_STEPS,
  getMessageByType,
  getRequestConfig,
} from './constants';
import { VerificationScreenProps, DeviceAction } from './types';
import { useVerificationAnimation } from './hooks';
import { useVerificationTimer } from './hooks';
import { useVerificationValidation } from './hooks';

type VerificationScreenRouteProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Verification'>;
  route: RouteProp<AuthStackParamList, 'Verification'>;
};

export default function VerificationScreen({
  navigation,
  route,
}: VerificationScreenRouteProps) {
  const {
    message,
    messageType,
    requestType,
    deviceAction,
    deviceNumber,
    fcmToken,
    osType,
    accessToken,
    refreshToken,
  } = route.params as VerificationScreenProps;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [selectedDeviceAction, setSelectedDeviceAction] = useState<
    DeviceAction | undefined
  >(deviceAction);

  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );
  const tintColor = useThemeColor(
    { light: '#2E5BFF', dark: '#4A90E2' },
    'tint',
  );

  const { fadeAnim, scaleAnim, startAnimation } = useVerificationAnimation();
  const { timeLeft, isTimerActive, startTimer, stopTimer } =
    useVerificationTimer();
  const { errors, validatePhoneNumber, validateVerificationCode, clearErrors } =
    useVerificationValidation();

  const { signIn } = useAuth();

  // 동적 메시지와 설정 (기존 message 필드 우선, 없으면 messageType 사용)
  const dynamicMessage = useMemo(() => {
    if (message) return message;
    return getMessageByType(messageType || 'FIRST_LOGIN');
  }, [message, messageType]);

  const requestConfig = useMemo(
    () => getRequestConfig(requestType),
    [requestType],
  );

  // 현재 단계 데이터를 동적으로 생성
  const currentStepData = useMemo(() => {
    const baseStep = VERIFICATION_STEPS[currentStep];

    // 첫 번째 단계의 메시지를 동적으로 변경
    if (currentStep === 0) {
      // 디바이스 불일치인 경우 기기 등록 방식 선택 UI 표시
      if (messageType === 'DIFFERENT_DEVICE' && !selectedDeviceAction) {
        return {
          ...baseStep,
          title: '기기 등록 확인',
          subtitle:
            '등록된 디바이스가 다릅니다. 기존 기기 등록을 해제하고 새로운 기기로 등록하시겠습니까?',
          buttonText: '본인인증 시작하기',
        };
      }

      return {
        ...baseStep,
        subtitle: dynamicMessage,
      };
    }

    // 인증번호 입력 단계의 설정을 동적으로 변경
    if (currentStep === 2) {
      return {
        ...baseStep,
        icon: requestConfig.icon,
        subtitle: requestConfig.subtitle,
      };
    }

    return baseStep;
  }, [
    currentStep,
    dynamicMessage,
    requestConfig,
    messageType,
    selectedDeviceAction,
    // deviceActionMessage,
  ]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // 휴대폰 번호 유효성 검사 및 인증번호 발송
  const handlePhoneNumberSubmit = useCallback(async () => {
    if (!validatePhoneNumber(phoneNumber)) return;

    setIsLoading(true);
    clearErrors();

    try {
      // 실제 API 호출로 인증번호 발송 (현재는 시뮬레이션)
      // await sendVerificationCode(phoneNumber, requestType, accessToken);

      setIsPhoneVerified(true);
      setCurrentStep(2);
      startTimer();
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '인증번호 발송 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    phoneNumber,
    requestType,
    accessToken,
    validatePhoneNumber,
    clearErrors,
    startTimer,
  ]);

  // 인증번호 재발송
  const handleResendCode = useCallback(async () => {
    if (!isPhoneVerified) return;

    setIsLoading(true);

    try {
      // await sendVerificationCode(phoneNumber, requestType, accessToken);
      startTimer();
      Alert.alert('알림', '인증번호가 재발송되었습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '인증번호 재발송 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isPhoneVerified, phoneNumber, requestType, accessToken, startTimer]);

  // 인증번호 확인 및 디바이스 등록
  const handleVerificationCodeSubmit = useCallback(async () => {
    if (!validateVerificationCode(verificationCode)) return;

    setIsLoading(true);
    clearErrors();

    try {
      if (messageType === 'DIFFERENT_DEVICE') {
        try {
          await deleteUserDevice(accessToken);
          console.info('Previous device deleted successfully');
        } catch (deleteError) {
          console.error('Failed to delete previous device:', deleteError);
          throw new Error(
            '이전 디바이스 삭제에 실패했습니다. 보안상 새 디바이스 등록이 불가능합니다.',
          );
        }
      }
      const deviceResponse = await registerDevice(
        deviceNumber,
        fcmToken,
        osType,
        accessToken,
      );

      if (!deviceResponse.success) {
        throw new Error('디바이스 등록에 실패했습니다.');
      }

      // 3. 사용자 인증
      if (messageType === 'FIRST_LOGIN') {
        // 본인인증을 했다고 가정하고 (첫 로그인)진행. 그외는 따로 본인인증을 진행한다고 가정
        await verifyUser(accessToken);
      }

      setCurrentStep(3);
      stopTimer();
      Alert.alert('성공', '인증이 완료되었습니다!');
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '인증번호 확인 중 오류가 발생했습니다.',
      );
      navigation.replace('Login');
    } finally {
      setIsLoading(false);
    }
  }, [
    verificationCode,
    validateVerificationCode,
    clearErrors,
    stopTimer,
    deviceNumber,
    fcmToken,
    osType,
    accessToken,
  ]);

  // 홈으로 이동
  const handleHomeNavigation = useCallback(async () => {
    try {
      await signIn(accessToken, refreshToken);
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    }
  }, [signIn, accessToken, refreshToken]);

  // 단계별 버튼 동작 처리
  const handleButtonPress = useCallback(async () => {
    switch (currentStep) {
      case 0: // 본인인증 시작 또는 기기 등록 방식 선택
        setCurrentStep(1);
        break;
      case 1: // 휴대폰 번호 입력
        handlePhoneNumberSubmit();
        break;
      case 2: // 인증번호 입력
        handleVerificationCodeSubmit();
        break;
      case 3: // 인증 완료
        handleHomeNavigation();
        break;
    }
  }, [
    currentStep,
    messageType,
    selectedDeviceAction,
    handlePhoneNumberSubmit,
    handleVerificationCodeSubmit,
    handleHomeNavigation,
  ]);

  // 이전 단계로 돌아가기
  const handleBackStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        stopTimer();
      }
    }
  }, [currentStep, stopTimer]);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={'height'} style={styles.keyboardAvoid}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Animated.View
                style={[
                  styles.verificationContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {currentStepData && (
                  <>
                    <ProgressIndicator
                      currentStep={currentStep}
                      totalSteps={VERIFICATION_STEPS.length}
                      tintColor={tintColor}
                    />
                    <StepIcon
                      icon={currentStepData.icon}
                      tintColor={tintColor}
                    />
                    <ThemedText style={styles.title}>
                      {currentStepData.title}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                      {currentStepData.subtitle}
                    </ThemedText>
                  </>
                )}
                {/* 인증입력 */}
                <VerificationInput
                  step={currentStepData}
                  phoneNumber={phoneNumber}
                  verificationCode={verificationCode}
                  onPhoneNumberChange={setPhoneNumber}
                  onVerificationCodeChange={setVerificationCode}
                  errors={errors}
                  timeLeft={timeLeft}
                  isTimerActive={isTimerActive}
                  onResendCode={handleResendCode}
                />
                {/* 인증버튼 */}
                <VerificationButton
                  currentStep={currentStep}
                  totalSteps={VERIFICATION_STEPS.length}
                  currentStepData={currentStepData}
                  onPress={handleButtonPress}
                  onBack={currentStep > 0 ? handleBackStep : undefined}
                  isLoading={isLoading}
                  canGoBack={currentStep > 0}
                />
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  verificationContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 40,
  },
  deviceActionContainer: {
    width: '100%',
    marginBottom: 32,
  },
  deviceActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  deviceActionDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 32,
  },
  deviceActionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  deviceActionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  deviceActionButtonReject: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  deviceActionButtonAccept: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  deviceActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  deviceActionButtonSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  deviceActionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceActionCheckboxText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  deviceActionCheckboxInput: {
    width: 20,
    height: 20,
  },
});
