import { AuthButton, AuthInput, DatePicker } from '@/components/auth';
import { SvgLogo, ThemedText, ThemedView } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { signup } from '@/services/apis/account';
import {
  isValidDate,
  isValidPhoneNumber,
  removeHyphens,
} from '@/utils/format.utils';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

export default function SignupPage({ navigation }: SignupScreenProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordCheck, setPasswordCheck] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [birth, setBirth] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    loginId?: string;
    password?: string;
    passwordCheck?: string;
    name?: string;
    phone?: string;
    birth?: string;
  }>({});

  const { width, height } = Dimensions.get('window');
  const logoWidth = Math.min(width, height) * 0.4; // 화면 크기의 60%로 로고 너비 설정
  const logoHeight = logoWidth * 0.465;

  const tintColor = useThemeColor(
    { light: '#2E5BFF', dark: '#2E5BFF' },
    'tint',
  );
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );

  // 화면 크기 가져오기
  const statusBarHeight = 0;

  // iOS 기기 높이에 따른 패딩 조정
  const getTopPadding = (): number => {
    if (Platform.OS !== 'ios') return 40;

    if (height <= 667) {
      // iPhone SE, iPhone 8 등 작은 화면
      return 20;
    } else if (height <= 812) {
      // iPhone X, 11 Pro, 12 mini 등 중간 화면
      return 30;
    } else {
      // iPhone 11, 12, 13 Pro Max 등 큰 화면
      return 40;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      loginId?: string;
      password?: string;
      passwordCheck?: string;
      name?: string;
      phone?: string;
      birth?: string;
    } = {};

    // 이메일 검증
    if (!loginId) {
      newErrors.loginId = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(loginId)) {
      newErrors.loginId = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 7) {
      newErrors.password = '비밀번호는 최소 7자 이상이어야 합니다';
    }

    // 비밀번호 확인 검증
    if (!passwordCheck) {
      newErrors.passwordCheck = '비밀번호 확인을 입력해주세요';
    } else if (passwordCheck !== password) {
      newErrors.passwordCheck = '비밀번호가 일치하지 않습니다';
    }

    // 이름 검증
    if (!name) {
      newErrors.name = '이름을 입력해주세요';
    }

    // 전화번호 검증
    if (!phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!isValidPhoneNumber(phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
    }

    // 생년월일 검증
    if (!birth) {
      newErrors.birth = '생년월일을 입력해주세요';
    } else if (!isValidDate(birth)) {
      newErrors.birth = '올바른 생년월일 형식이 아닙니다 (예: 1999-01-01)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // API 요청 수행
      await signup(loginId, password, passwordCheck, name, phone, birth);

      Alert.alert(
        '회원가입 성공',
        '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.',
        [{ text: '확인', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? statusBarHeight : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
          >
            <View
              style={[styles.contentContainer, { paddingTop: getTopPadding() }]}
            >
              <View style={styles.header}>
                <ThemedText style={styles.title}>Pyokemon</ThemedText>
              </View>

              <View style={styles.form}>
                <AuthInput
                  value={loginId}
                  onChangeText={setLoginId}
                  placeholder="이메일 (예: example@gmail.com)"
                  keyboardType="email-address"
                  error={errors.loginId}
                />

                <AuthInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호를 입력하세요"
                  secureTextEntry
                  error={errors.password}
                />

                <AuthInput
                  value={passwordCheck}
                  onChangeText={setPasswordCheck}
                  placeholder="비밀번호를 다시 입력하세요"
                  secureTextEntry
                  error={errors.passwordCheck}
                />

                <AuthInput
                  value={name}
                  onChangeText={setName}
                  placeholder="이름 (예: 홍길동)"
                  error={errors.name}
                />
                <AuthInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="전화번호 (예: 010-1234-5678)"
                  inputType="phone"
                  error={errors.phone}
                />

                <DatePicker
                  value={birth}
                  onChange={setBirth}
                  error={errors.birth}
                  maxDate={new Date()}
                  minDate={new Date(1900, 0, 1)}
                  label="생년월일"
                />
              </View>
              <View>
                <AuthButton
                  title="회원가입"
                  onPress={handleSignup}
                  isLoading={isLoading}
                />
                <View style={styles.loginContainer}>
                  <ThemedText style={styles.loginText}>
                    이미 계정이 있으신가요?
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                  >
                    <ThemedText
                      style={[styles.loginLink, { color: tintColor }]}
                    >
                      로그인
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
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
    minHeight: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Platform.OS === 'ios' ? 20 : 32,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    fontFamily: 'Bungee-Regular',
    fontWeight: '400',
    lineHeight: 40,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  loginText: {
    marginRight: 4,
  },
  loginLink: {
    fontWeight: '600',
    padding: 4,
  },
});
