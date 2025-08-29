import {AuthButton, AuthInput} from '../../components/auth';
import {ThemedText, ThemedView} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
// import { login } from '../../services/apis/account';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import { getUniqueId } from 'react-native-device-info';
// import messaging from '@react-native-firebase/messaging';
import React, {useState} from 'react';
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
import {textUpper} from '../../common/text-common';
import {AuthStackParamList} from '../../types/navigation';
import useAuth from '../../hooks/useAuth';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const {signIn} = useAuth();

  const {width, height} = Dimensions.get('window');
  const logoWidth = Math.min(width, height) * 0.4; // 화면 크기의 60%로 로고 너비 설정

  const tintColor = useThemeColor({light: '#807F7F', dark: '#2E5BFF'}, 'tint');
  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );

  const statusBarHeight = 0;

  const validateForm = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};

    if (!loginId) {
      newErrors.email = '아이디를 입력해주세요';
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
    setIsLoading(true);

    try {
      // 수정 예정 Spring Boot 쪽에서 처리해야 함
      // const deviceNumber = await getUniqueId();
      // const response = await login(loginId, password, deviceNumber);
      // 디바이스 등록 여부가 없을 시 등록 과정
      //   const osType = textUpper(Platform.OS);
      //   // const fcmToken = await messaging().getToken();
      //   const fcmToken = 'fcm';
      //   if (response.deviceStatus === 'NOT_REGISTERED') {
      //     navigation.navigate('Verification', {
      //       messageType: 'FIRST_LOGIN',
      //       deviceNumber,
      //       fcmToken,
      //       osType,
      //       accessToken: response.accessToken,
      //       refreshToken: response.refreshToken,
      //     });
      //   } else if (response.deviceStatus === 'MISMATCHED') {
      //     navigation.navigate('Verification', {
      //       messageType: 'DIFFERENT_DEVICE',
      //       deviceNumber,
      //       accountId: response.accountId,
      //       fcmToken,
      //       osType,
      //       accessToken: response.accessToken,
      //       refreshToken: response.refreshToken,
      //     });
      //   } else {
      //     signIn(response.accessToken, response.refreshToken);
      //   }
      // } catch (error: any) {
      //   Alert.alert('로그인에 실패했습니다.', error.message);
      // }
    } catch (error: any) {
      Alert.alert('로그인에 실패했습니다.', error.message);
    }
    setIsLoading(false);
  };

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}>
            <View style={[styles.contentContainer]}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>Pyokemon</ThemedText>
              </View>

              <View style={styles.form}>
                <AuthInput
                  value={loginId}
                  onChangeText={setLoginId}
                  placeholder="아이디를 입력하세요"
                  keyboardType="default"
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
                    onPress={() => navigation.navigate('Signup')}>
                    <ThemedText style={[styles.signupLink, {color: tintColor}]}>
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
    paddingBottom: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
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
