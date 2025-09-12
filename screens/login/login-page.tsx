import {AuthButton, AuthInput} from '../../components/auth';
import {
  ThemedText,
  ThemedView,
  showErrorAlert,
  showConfirmAlert,
} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
import {login} from '../../services/apis/account';
import {StackNavigationProp} from '@react-navigation/stack';
import {getUniqueId} from 'react-native-device-info';
import {getMessaging, getToken} from '@react-native-firebase/messaging';
import React, {useState, useEffect} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {textUpper} from '../../common/text-common';
import {AuthStackParamList} from '../../types/navigation';
import useAuth from '../../hooks/useAuth';
import {useInitializeAgentForNewUser} from '../../contexts/agent-provider';
import {getWalletInfo} from '../../services/storage/walletStorage';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {BackHandler} from 'react-native';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const {signIn} = useAuth();
  const initializeAgentForNewUser = useInitializeAgentForNewUser();

  const tintColor = useThemeColor({light: '#807F7F', dark: '#2E5BFF'}, 'tint');
  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );

  // 알람 권한 확인 및 요청 (Android만)
  useEffect(() => {
    const checkAlarmPermission = async () => {
      // iOS는 제외하고 Android만 처리
      if (Platform.OS === 'android') {
        try {
          const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);

          switch (result) {
            case RESULTS.UNAVAILABLE:
              showErrorAlert(
                '알람 권한 오류',
                '이 기기에서는 알람 권한을 사용할 수 없습니다.',
                () => BackHandler.exitApp(),
              );
              break;
            case RESULTS.DENIED:
              const requestResult = await request(
                PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
              );
              if (requestResult !== RESULTS.GRANTED) {
                showConfirmAlert(
                  '알람 권한 필요',
                  '앱 사용을 위해 알람 권한이 필요합니다. 권한을 허용해주세요.',
                  () => BackHandler.exitApp(),
                  () => BackHandler.exitApp(),
                  '설정으로 이동',
                  '앱 종료',
                );
              }
              break;
            case RESULTS.BLOCKED:
              showErrorAlert(
                '알람 권한 차단됨',
                '설정에서 알람 권한을 허용해주세요.',
                () => BackHandler.exitApp(),
              );
              break;
            case RESULTS.LIMITED:
            case RESULTS.GRANTED:
              break;
          }
        } catch (error) {
          console.error('알람 권한 확인 중 오류:', error);
          showErrorAlert(
            '권한 확인 오류',
            '알람 권한을 확인하는 중 오류가 발생했습니다.',
            () => BackHandler.exitApp(),
          );
        }
      }
    };

    checkAlarmPermission();
  }, []);

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
      const deviceNumber = await getUniqueId();
      const response = await login(loginId, password, deviceNumber);
      // 디바이스 등록 여부가 없을 시 등록 과정
      const osType = textUpper(Platform.OS);
      // Firebase v22 방식으로 업데이트
      const fcmToken = await getToken(getMessaging());
      if (response.deviceStatus === 'NOT_REGISTERED') {
        navigation.navigate('Verification', {
          messageType: 'FIRST_LOGIN',
          deviceNumber,
          fcmToken,
          osType,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else if (response.deviceStatus === 'MISMATCHED') {
        navigation.navigate('Verification', {
          messageType: 'DIFFERENT_DEVICE',
          deviceNumber,
          accountId: response.accountId,
          fcmToken,
          osType,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        await signIn(
          response.accessToken,
          response.refreshToken,
          response.accountId,
        );

        // 최초 지갑 생성 시에만 Agent 초기화
        try {
          console.log('로그인 성공 후 최초 지갑 생성 확인...');
          const savedWalletInfo = await getWalletInfo();

          if (!savedWalletInfo || !savedWalletInfo.createdAt) {
            console.log('🆕 최초 사용자 - Agent 초기화 시작...');
            await initializeAgentForNewUser(
              response.accountId,
              response.accessToken,
            );
            console.log('✅ 최초 사용자 Agent 초기화 완료');
          } else {
            console.log(
              '✅ 기존 사용자 - AgentProvider에서 자동으로 Agent 관리됩니다.',
            );
          }
        } catch (walletError: any) {
          // console.error('Agent 초기화 실패:', walletError);
          // Alert.alert(
          //   '알림',
          //   'Agent 초기화 중 문제가 발생했습니다. 나중에 다시 시도해주세요.',
          // );
          // Agent 초기화 실패해도 로그인 프로세스는 계속 진행
        }
      }
    } catch (error: any) {
      showErrorAlert('로그인 실패', error.message);
    }
    setIsLoading(false);
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
