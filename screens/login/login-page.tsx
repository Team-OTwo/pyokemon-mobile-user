import { AuthButton, AuthInput } from '@/components/auth';
import { SvgLogo, ThemedText, ThemedView } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const { width, height } = Dimensions.get('window');
  const logoWidth = Math.min(width, height) * 0.4; // 화면 크기의 60%로 로고 너비 설정
  const logoHeight = logoWidth * 0.465; // SVG 비율 유지 (129:60 = 2.15:1)

  const tintColor = useThemeColor(
    { light: '#807F7F', dark: '#2E5BFF' },
    'tint',
  );
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );

  const statusBarHeight = 0;

  // iOS 기기 높이에 따른 패딩 조정
  const getTopPadding = (): number => {
    if (Platform.OS !== 'ios') return 40;

    if (height <= 667) {
      // iPhone SE, iPhone 8 등 작은 화면
      return 30;
    } else if (height <= 812) {
      // iPhone X, 11 Pro, 12 mini 등 중간 화면
      return 50;
    } else {
      // iPhone 11, 12, 13 Pro Max 등 큰 화면
      return 60;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 4) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    navigation.navigate('Home');
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
                  placeholder="이메일을 입력하세요"
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
              </View>

              <View>
                <AuthButton
                  title="로그인"
                  onPress={handleLogin}
                  isLoading={isLoading}
                />

                <View style={styles.signupContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                  >
                    <ThemedText
                      style={[styles.signupLink, { color: tintColor }]}
                    >
                      아직 계정이 없으신가요?
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
    marginBottom: Platform.OS === 'ios' ? 24 : 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
    padding: 4,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  signupText: {
    marginRight: 4,
  },
  signupLink: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
