import {AuthButton, AuthInput} from '../../components/auth';
import {ThemedText, ThemedView} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
import {login} from '../../services/apis/account';
import {StackNavigationProp} from '@react-navigation/stack';
import {getUniqueId} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import React, {useState} from 'react';
import {
  Alert,
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
import {getInvitationUrls} from '../../services/apis/did';
import {
  generateBatchConnections,
  initAgent,
  setupConnectionEventListeners,
  changeConnectionUrl,
  sendAgentPublicDidToUser,
} from '../../services/did/credo';
import {Agent} from '@credo-ts/core';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const {signIn} = useAuth();

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
      const deviceNumber = await getUniqueId();
      const response = await login(loginId, password, deviceNumber);
      // 디바이스 등록 여부가 없을 시 등록 과정
      const osType = textUpper(Platform.OS);
      // Firebase v22 방식으로 업데이트
      const fcmToken = await messaging().getToken();
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

        // 로그인 성공 후 지갑 초기화 시도
        try {
          console.log('로그인 성공 후 지갑 초기화 시도...');

          // 1. 초대 URL 요청
          console.log('초대 URL 요청 중...');
          const invitationResponse = await getInvitationUrls(
            response.accessToken,
          );
          console.log('invitationResponse', invitationResponse);

          // 응답 데이터 검증
          if (!invitationResponse?.data) {
            throw new Error('초대 URL 응답 데이터가 없습니다');
          }

          if (
            !invitationResponse.data.mediator_acapy_invi_url ||
            !invitationResponse.data.user_acapy_invi_url
          ) {
            throw new Error(
              '필수 초대 URL이 누락되었습니다 (Mediator: 8010, User: 8020)',
            );
          }

          // 2. Agent 초기화
          console.log('agent초기화 시작');
          const agent = await initAgent(response.accountId);
          console.log('agent초기화 완료');

          // 연결 상태 변경 이벤트 리스너 설정
          setupConnectionEventListeners(agent);

          // 3. URL 변환 및 확인
          console.log('원본 초대 URL:', {
            mediator: invitationResponse.data.mediator_acapy_invi_url, // 8010 포트 (Mediator ACA-Py)
            user: invitationResponse.data.user_acapy_invi_url, // 8020 포트 (User ACA-Py)
          });

          console.log('포트 확인 - mediator: 8010, user: 8020');

          // URL 변환 (localhost, user:, mediator: 등을 실제 IP로 변환)
          const invitationUrls = {
            mediator: changeConnectionUrl(
              invitationResponse.data.mediator_acapy_invi_url,
            ), // 8010 포트 (Mediator ACA-Py)
            user: changeConnectionUrl(
              invitationResponse.data.user_acapy_invi_url,
            ), // 8020 포트 (User ACA-Py)
          };

          console.log('변환된 초대 URL:', invitationUrls);

          // 연결 생성 (User ACA-Py를 먼저, 그 다음 Mediator ACA-Py 순차적으로 연결)
          console.log(
            'User ACA-Py를 먼저 연결하고, 그 다음 Mediator ACA-Py 연결 시작...',
          );
          const {allConnections, allSuccess} = await generateBatchConnections(
            agent,
            invitationUrls,
          );

          if (allSuccess) {
            console.log('🎉 두 ACA-Py 모두 성공적으로 연결되었습니다');
          } else {
            console.log(
              '⚠️ 일부 ACA-Py 연결에 실패했습니다. 부분적으로 작동할 수 있습니다.',
            );
          }
          await sendAgentPublicDidToUser(agent, allConnections[1].id);
        } catch (walletError: any) {
          console.error('지갑 초기화 실패:', walletError);
          Alert.alert(
            '알림',
            '지갑 초기화 중 문제가 발생했습니다. 나중에 다시 시도해주세요.',
          );
          // 지갑 초기화 실패해도 로그인 프로세스는 계속 진행
        }
      }
    } catch (error: any) {
      Alert.alert('로그인에 실패했습니다.', error.message);
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
