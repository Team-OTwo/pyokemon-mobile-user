import { AuthButton, AuthInput } from '@/components/auth';
import { ThemedText, ThemedView } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

// Types
type VerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Verification'>;
};

type VerificationStep = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  hasInput: boolean;
  inputType?: 'phone' | 'code';
  buttonText?: string;
};

type ValidationErrors = {
  phoneNumber?: string;
  verificationCode?: string;
};

// Constants
const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: 0,
    title: '본인 인증을 시작합니다',
    subtitle:
      '최초 로그인이시군요!\n안전한 서비스 이용을 위해\n본인 인증을 진행해주세요',
    icon: 'verified-user',
    hasInput: false,
    buttonText: '본인인증 시작하기',
  },
  {
    id: 1,
    title: '휴대폰 인증',
    subtitle: '휴대폰 번호를 입력하여\n본인 확인을 진행합니다',
    icon: 'phone-android',
    hasInput: true,
    inputType: 'phone',
    buttonText: '인증번호 발송',
  },
  {
    id: 2,
    title: '인증번호 확인',
    subtitle: '발송된 인증번호를\n입력해주세요',
    icon: 'sms',
    hasInput: true,
    inputType: 'code',
    buttonText: '인증 확인',
  },
  {
    id: 3,
    title: '인증 완료',
    subtitle: '본인 인증이 완료되었습니다\n메인 페이지로 이동합니다',
    icon: 'check-circle',
    hasInput: false,
    buttonText: '홈으로 이동하기',
  },
];

const PHONE_REGEX = /^01[0-9]\d{3,4}\d{4}$/;
const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_TIMEOUT_SECONDS = 180; // 3분

// Custom Hooks
const useVerificationAnimation = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const startAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return { fadeAnim, scaleAnim, startAnimation };
};

const useVerificationTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  const startTimer = useCallback(() => {
    setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
    setIsTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
    setTimeLeft(0);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timeLeft]);

  return {
    timeLeft,
    isTimerActive,
    startTimer,
    stopTimer,
    formatTime,
  };
};

const useVerificationValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    if (!phoneNumber) {
      setErrors({ phoneNumber: '휴대폰 번호를 입력해주세요' });
      return false;
    }
    if (!PHONE_REGEX.test(phoneNumber)) {
      setErrors({
        phoneNumber: '올바른 휴대폰 번호 형식이 아닙니다 (예: 01012345678)',
      });
      return false;
    }
    setErrors({});
    return true;
  }, []);

  const validateVerificationCode = useCallback(
    (verificationCode: string): boolean => {
      if (!verificationCode) {
        setErrors({ verificationCode: '인증번호를 입력해주세요' });
        return false;
      }
      if (verificationCode.length !== VERIFICATION_CODE_LENGTH) {
        setErrors({ verificationCode: '인증번호는 6자리입니다' });
        return false;
      }
      setErrors({});
      return true;
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validatePhoneNumber,
    validateVerificationCode,
    clearErrors,
  };
};

// Components
const ProgressIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
  tintColor: string;
}> = ({ currentStep, totalSteps, tintColor }) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: totalSteps }, (_, index) => (
      <View
        key={index}
        style={[
          styles.progressDot,
          {
            backgroundColor: index <= currentStep ? tintColor : '#E0E0E0',
          },
        ]}
      />
    ))}
  </View>
);

const StepIcon: React.FC<{ icon: string; tintColor: string }> = ({
  icon,
  tintColor,
}) => {
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

const VerificationInput: React.FC<{
  step: VerificationStep;
  phoneNumber: string;
  verificationCode: string;
  onPhoneNumberChange: (text: string) => void;
  onVerificationCodeChange: (text: string) => void;
  errors: ValidationErrors;
  timeLeft: number;
  isTimerActive: boolean;
  onResendCode: () => void;
}> = ({
  step,
  phoneNumber,
  verificationCode,
  onPhoneNumberChange,
  onVerificationCodeChange,
  errors,
  timeLeft,
  isTimerActive,
  onResendCode,
}) => {
  if (!step.hasInput) return null;

  return (
    <View style={styles.inputContainer}>
      {step.inputType === 'phone' && (
        <AuthInput
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          placeholder="휴대폰 번호 (예: 01012345678)"
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />
      )}
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

// Main Component
export default function VerificationScreen({
  navigation,
}: VerificationScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  const { width, height } = Dimensions.get('window');
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

  const currentStepData = useMemo(
    () => VERIFICATION_STEPS[currentStep],
    [currentStep],
  );

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const handleSendVerificationCode = useCallback(async () => {
    if (!validatePhoneNumber(phoneNumber)) return;

    setIsLoading(true);

    // 실제로는 API 호출을 여기서 수행
    try {
      // 시뮬레이션을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentStep(2);
      clearErrors();
      startTimer();
    } catch (error) {
      // 에러 처리
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, validatePhoneNumber, clearErrors, startTimer]);

  const handleResendCode = useCallback(async () => {
    setIsLoading(true);

    try {
      // 실제로는 API 호출을 여기서 수행
      await new Promise(resolve => setTimeout(resolve, 1000));

      startTimer();
    } catch (error) {
      // 에러 처리
    } finally {
      setIsLoading(false);
    }
  }, [startTimer]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      handleSendVerificationCode();
    } else if (currentStep === 2) {
      if (validateVerificationCode(verificationCode)) {
        stopTimer();
        setCurrentStep(3);
        clearErrors();
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000);
      }
    }
  }, [
    currentStep,
    verificationCode,
    validateVerificationCode,
    clearErrors,
    navigation,
    handleSendVerificationCode,
    stopTimer,
  ]);

  const handleHomeNavigation = useCallback(() => {
    navigation.replace('Home');
  }, [navigation]);

  const renderButton = () => {
    if (currentStep === 0) {
      return (
        <View style={styles.buttonContainer}>
          <AuthButton
            title="본인인증 시작하기"
            onPress={handleNextStep}
            isLoading={isLoading}
          />
        </View>
      );
    }

    if (currentStep === VERIFICATION_STEPS.length - 1) {
      return (
        <View style={styles.buttonContainer}>
          <AuthButton title="홈으로 이동하기" onPress={handleHomeNavigation} />
        </View>
      );
    }

    if (currentStepData.hasInput) {
      return (
        <View style={styles.buttonContainer}>
          <AuthButton
            title={currentStepData.buttonText || ''}
            onPress={handleNextStep}
            isLoading={isLoading}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
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
                <ProgressIndicator
                  currentStep={currentStep}
                  totalSteps={VERIFICATION_STEPS.length}
                  tintColor={tintColor}
                />

                <StepIcon icon={currentStepData.icon} tintColor={tintColor} />

                <ThemedText style={styles.title}>
                  {currentStepData.title}
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  {currentStepData.subtitle}
                </ThemedText>

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

                {renderButton()}
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
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    justifyContent: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
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
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
});
