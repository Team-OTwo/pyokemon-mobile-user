import { AuthButton, AuthInput } from '@/components/auth';
import { SvgLogo, ThemedText, ThemedView } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    deviceId?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
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
      deviceId?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 7) {
      newErrors.password = '비밀번호는 최소 7자 이상이어야 합니다';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder="pyokemon@gmail.com"
                  keyboardType="email-address"
                  error={errors.email}
                />

                <AuthInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호를 입력하세요"
                  secureTextEntry
                  error={errors.password}
                />

                <AuthInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력하세요"
                  secureTextEntry
                  error={errors.confirmPassword}
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
