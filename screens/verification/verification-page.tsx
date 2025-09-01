import {ThemedText, ThemedView} from '../../components/common';
import useAuth from '../../hooks/useAuth';
import {useThemeColor} from '../../hooks/useThemeColor';
import {
  registerDevice,
  verifyDevice,
  verifyUser,
} from '../../services/apis/account';
import {AuthStackParamList} from '../../types/navigation';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import DIDService from '../../services/did/did-service';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
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
  getMessageByType,
  getRequestConfig,
  getVerificationSteps,
} from './constants';
import {VerificationScreenProps, DeviceAction} from './types';
import {useVerificationAnimation} from './hooks';
import {useVerificationTimer} from './hooks';
import {useVerificationValidation} from './hooks';

type VerificationScreenRouteProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Verification'>;
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
    accountId,
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

  const [name, setName] = useState<string>('');
  const [birth, setBirth] = useState<string>('');

  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );
  const tintColor = useThemeColor({light: '#2E5BFF', dark: '#4A90E2'}, 'tint');

  const {fadeAnim, scaleAnim, startAnimation} = useVerificationAnimation();
  const {timeLeft, isTimerActive, startTimer, stopTimer} =
    useVerificationTimer();
  const {
    errors,
    validatePhoneNumber,
    validateName,
    validateBirth,
    validateVerificationCode,
    clearErrors,
  } = useVerificationValidation();

  const {signIn} = useAuth();

  // 인증 모드별 단계 가져오기
  const verificationSteps = useMemo(
    () => getVerificationSteps(messageType || 'FIRST_LOGIN'),
    [messageType],
  );

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
    const baseStep = verificationSteps[currentStep];

    // 첫 번째 단계의 메시지를 동적으로 변경
    if (currentStep === 0) {
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
  }, [currentStep, dynamicMessage, requestConfig, verificationSteps]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // 휴대폰 번호 유효성 검사 및 인증번호 발송
  const handlePhoneNumberSubmit = useCallback(async () => {
    // 기기변경 모드일 때는 이름과 생년월일도 검증
    if (messageType === 'DIFFERENT_DEVICE') {
      if (!validateName(name)) return;
      if (!validateBirth(birth)) return;
    }

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
    validateName,
    validateBirth,
    clearErrors,
    startTimer,
    messageType,
    name,
    birth,
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
          // 기기변경 시: 본인인증 후 디바이스 변경 API 호출
          await verifyDevice({
            accountId,
            name,
            phoneNumber,
            birth,
            deviceNumber,
            fcmToken,
            osType,
          });
          console.info('Device verification completed successfully');
        } catch (verifyError) {
          console.error('Failed to verify device:', verifyError);
          throw new Error(
            '본인인증에 실패했습니다. 입력하신 정보를 다시 확인해주세요.',
          );
        }
      } else {
        // 첫 기기등록 시: 일반 디바이스 등록
        const deviceResponse = await registerDevice(
          deviceNumber,
          fcmToken,
          osType,
          accessToken,
        );

        if (!deviceResponse.success) {
          throw new Error('디바이스 등록에 실패했습니다.');
        }
      }

      // 3. 사용자 인증
      if (messageType === 'FIRST_LOGIN') {
        // 본인인증을 했다고 가정하고 (첫 로그인)진행. 그외는 따로 본인인증을 진행한다고 가정
        await verifyUser(accessToken);

        // DID 초기화는 로그인 시 useWallet 훅에서 처리하도록 변경
        // 첫 로그인 시에는 본인인증 후 로그인 시 지갑 초기화 및 연결 진행
        console.log('DID 초기화는 로그인 시 useWallet 훅에서 처리됩니다.');
        // 본인인증 성공 후 로그인 페이지로 이동하면 로그인 시 자동으로 지갑 초기화
      }

      setCurrentStep(3);
      stopTimer();
      if (messageType === 'DIFFERENT_DEVICE') {
        Alert.alert('성공', '기기변경이 완료되었습니다! 다시 로그인해주세요.');
      } else {
        Alert.alert('성공', '인증이 완료되었습니다! 다시 로그인해주세요.');
      }
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
    messageType,
    accountId,
    name,
    phoneNumber,
    birth,
    navigation,
  ]);

  // 홈으로 이동
  const handleHomeNavigation = useCallback(async () => {
    try {
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    }
  }, [signIn, accessToken, refreshToken, messageType, navigation]);

  // 단계별 버튼 동작 처리
  const handleButtonPress = useCallback(async () => {
    switch (currentStep) {
      case 0: // 본인인증 시작
        setCurrentStep(1);
        break;
      case 1: // 휴대폰 번호 입력 또는 본인정보 입력
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
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardAvoid}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag">
            <View style={styles.content}>
              <Animated.View
                style={[
                  styles.verificationContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{scale: scaleAnim}],
                  },
                ]}>
                {currentStepData && (
                  <>
                    <ProgressIndicator
                      currentStep={currentStep}
                      totalSteps={verificationSteps.length}
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
                  name={name}
                  birth={birth}
                  onNameChange={setName}
                  onBirthChange={setBirth}
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
                  totalSteps={verificationSteps.length}
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
    justifyContent: 'center',
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
