import {AuthButton, AuthInput, DatePicker} from '../../components/auth';
import {ThemedText, ThemedView, showErrorAlert} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
import {signup} from '../../services/apis/account';
import {AuthStackParamList} from '../../types/navigation';
import {validateSignupForm} from '../../utils/auth-validation.utils';
import {StackNavigationProp} from '@react-navigation/stack';
import {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type SignupScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Signup'>;
};

export default function SignupPage({navigation}: SignupScreenProps) {
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

  const tintColor = useThemeColor({light: '#2E5BFF'}, 'tint');
  const backgroundColor = useThemeColor({light: '#FFFFFF'}, 'background');

  const validateForm = (): boolean => {
    const formData = {
      loginId,
      password,
      passwordCheck,
      name,
      phone,
      birth,
    };

    const validationResult = validateSignupForm(formData);
    setErrors(validationResult.errors);

    return validationResult.isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // API 요청 수행
      await signup(loginId, password, passwordCheck, name, phone, birth);

      showErrorAlert(
        '회원가입 성공',
        '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.',
        () => navigation.navigate('Login'),
      );
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      showErrorAlert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}>
            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>Pyokemon</ThemedText>
              </View>

              <View style={styles.form}>
                <AuthInput
                  value={loginId}
                  onChangeText={setLoginId}
                  placeholder="아이디"
                  keyboardType="default"
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
                    onPress={() => navigation.navigate('Login')}>
                    <ThemedText style={[styles.loginLink, {color: tintColor}]}>
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
    paddingBottom: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
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
