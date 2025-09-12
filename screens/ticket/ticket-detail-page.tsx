import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
  Alert,
  Text,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {AuthButton} from '../../components/auth';
import {
  ThemedText,
  ThemedView,
  showErrorAlert,
  showSuccessAlert,
} from '../../components/common';
import PageHeader from '../../components/ui/header';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAgentStatus} from '../../contexts/agent-provider';
import {getDetailTicket} from '../../services/apis/ticket';
import {getCredential} from '../../services/apis/did';
import useAuth from '../../hooks/useAuth';
import {MainStackParamList} from '../../types/navigation';
import type {TicketDetail} from '../../types/ticket';

// 상수 정의
const ANIMATION_CONFIG = {
  SCROLL_THRESHOLD: 150,
  IMAGE_HEIGHT_RANGE: [250, 120] as number[],
  OPACITY_RANGE: [1, 0.7] as number[],
} as const;

const VC_POLLING_CONFIG = {
  MAX_ATTEMPTS: 5,
  INTERVAL: 2000,
} as const;

type TicketDetailProps = {
  navigation: StackNavigationProp<MainStackParamList, 'TicketDetail'>;
  route: RouteProp<MainStackParamList, 'TicketDetail'>;
};

export default function TicketDetail({navigation, route}: TicketDetailProps) {
  const {bookingId} = route.params;
  const {user} = useAuth();
  const {isInitialized, agent} = useAgentStatus();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [credential, setCredential] = useState<string | null>(null);
  const [isVc, setIsVc] = useState(false);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRequestedVC, setHasRequestedVC] = useState(false);

  // 공연일 체크 로직
  const isEventToday = useMemo(() => {
    if (!ticket?.event?.eventDate) return false;

    const today = new Date();
    const eventDate = new Date(ticket.event.eventDate);

    // 날짜만 비교 (시간 제외)
    return (
      today.getFullYear() === eventDate.getFullYear() &&
      today.getMonth() === eventDate.getMonth() &&
      today.getDate() === eventDate.getDate()
    );
  }, [ticket?.event?.eventDate]);

  // 티켓 데이터 페칭
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const ticketData = await getDetailTicket(bookingId);
        setTicket(ticketData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '티켓을 불러오는데 실패했습니다',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId]);

  // 애니메이션 값들
  const scrollY = useRef(new Animated.Value(0)).current;
  const imageHeight = scrollY.interpolate({
    inputRange: [0, ANIMATION_CONFIG.SCROLL_THRESHOLD],
    outputRange: ANIMATION_CONFIG.IMAGE_HEIGHT_RANGE,
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, ANIMATION_CONFIG.SCROLL_THRESHOLD],
    outputRange: ANIMATION_CONFIG.OPACITY_RANGE,
    extrapolate: 'clamp',
  });

  // 테마 색상
  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#1E2022'},
    'background',
  );
  const textColor = useThemeColor({light: '#000000', dark: '#FFFFFF'}, 'text');
  const borderColor = useThemeColor(
    {light: '#DDDDDB', dark: '#2C3235'},
    'text',
  );

  const handleGenerateQR = () => {
    navigation.navigate('TicketQR', {
      bookingId: ticket?.bookingId || '',
      credential: credential || '',
    });
  };

  // 버튼 상태 결정
  const getButtonConfig = () => {
    if (credential) {
      return {
        title: 'QR 생성',
        onPress: handleGenerateQR,
        disabled: !isEventToday,
        isLoading: false,
      };
    }

    if (!isInitialized) {
      return {
        title: 'Agent 초기화 필요',
        onPress: () => {
          showErrorAlert(
            '지갑 초기화 필요',
            '지갑이 생성되지 않았습니다. 홈 화면에서 지갑을 먼저 초기화해주세요.',
          );
        },
        disabled: true,
        isLoading: false,
      };
    }

    return {
      title: isEventToday ? '디지털 티켓 발급' : '공연개최일이 아닙니다',
      onPress: handleGetCredential,
      disabled: !isEventToday,
      isLoading: isVc,
    };
  };

  // VC 발급 처리
  const handleGetCredential = async () => {
    try {
      setIsVc(true);

      // 기본 검증
      if (!user || !isInitialized || !agent) {
        showErrorAlert(
          '오류',
          '사용자 정보 또는 Agent가 초기화되지 않았습니다.',
        );
        return;
      }

      const DIDService = await import('../../services/did/did-service');

      // 2. 새로운 VC 요청 및 폴링
      await getCredential(ticket?.bookingId || '');
      setHasRequestedVC(false);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let attempts = 0;

      while (attempts < VC_POLLING_CONFIG.MAX_ATTEMPTS) {
        attempts++;
        const pollingResult: any = await DIDService.default.pollForCredentials(
          agent,
        );

        if (pollingResult.success && pollingResult.newCredentials?.[0]) {
          const credentialData =
            (pollingResult.newCredentials[0] as any).credentialData ||
            pollingResult.newCredentials[0];
          const bookingId =
            credentialData.credentialSubject?.booking_id ||
            credentialData.credentialSubject?.bookingId ||
            credentialData.booking_id ||
            credentialData.bookingId;

          if (bookingId === ticket?.bookingId) {
            console.log('credentialData: ' + credentialData);
            showSuccessAlert(
              '성공',
              '디지털 티켓을 성공적으로 발급받았습니다.',
            );
            return;
          }
        }

        if (attempts < VC_POLLING_CONFIG.MAX_ATTEMPTS) {
          await new Promise(resolve =>
            setTimeout(resolve, VC_POLLING_CONFIG.INTERVAL),
          );
        }
      }
      showSuccessAlert('성공', '디지털 티켓을 성공적으로 발급받았습니다.');
    } catch (error) {
      showErrorAlert('오류', '디지털 티켓 발급 처리 중 오류가 발생했습니다.');
    } finally {
      setIsVc(false);
    }
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>
              티켓을 불러오는 중...
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <AuthButton
              title="다시 시도"
              onPress={() => {
                setError(null);
                setIsLoading(true);
                // fetchTicket();
              }}
            />
            <AuthButton title="돌아가기" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 티켓이 없는 경우 처리
  if (!ticket) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFoundContainer}>
            <ThemedText style={styles.notFoundText}>
              티켓을 찾을 수 없습니다.
            </ThemedText>
            <AuthButton title="돌아가기" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      {/* <StatusBar barStyle="default" /> */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}>
          <PageHeader
            title="티켓 상세"
            onBackPress={() => navigation.goBack()}
          />

          <View style={styles.ticketContainer}>
            {/* 썸네일 이미지 */}
            {ticket && (
              <Animated.View
                style={[
                  styles.thumbnailContainer,
                  {
                    height: imageHeight,
                    opacity: imageOpacity,
                  },
                ]}>
                <Image
                  source={{uri: ticket.event.thumbnailUrl}}
                  style={styles.thumbnail}
                />
              </Animated.View>
            )}

            {/* 티켓 제목 */}
            <ThemedText style={styles.ticketTitle}>
              {ticket.event.title}
            </ThemedText>

            {/* 티켓 정보 */}
            <View style={[styles.infoCard, {borderColor}]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>일시</Text>
                <Text style={styles.infoValue}>{ticket.event.eventDate}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>장소</Text>
                <Text style={styles.infoValue}>{ticket.event.venue.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>좌석</Text>
                <Text style={styles.infoValue}>
                  {ticket.seat.className}-{ticket.seat.floor}-{ticket.seat.row}-
                  {ticket.seat.col}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>발급처</Text>
                <Text style={styles.infoValue}>{ticket.tenantName}</Text>
              </View>
            </View>

            {/* 안내 사항 */}
            <View style={styles.noticeContainer}>
              <Text style={styles.noticeTitle}>입장 안내</Text>
              <Text style={styles.noticeText}>
                • 입장 시 QR 코드를 생성하여 게이트에서 스캔해주세요.{'\n'}• QR
                코드는 생성 후 3분간 유효합니다.{'\n'}• 입장 후에는 티켓 상태가
                (사용됨) 으로 변경됩니다.{'\n'}• 한 번 사용된 티켓은 재사용이
                불가능합니다.
              </Text>
            </View>
          </View>
        </Animated.ScrollView>

        {/* 하단 버튼 영역 */}
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.buttonContainer}>
            <AuthButton {...getButtonConfig()} />
          </View>
        </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FF5959',
    textAlign: 'center',
    marginBottom: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  ticketContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    height: 250,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: -20,
    marginHorizontal: -16,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ticketTitle: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  infoCard: {
    flexDirection: 'column',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 16,

    padding: 20,
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: 60,
    fontSize: 16,
    opacity: 0.7,
    marginRight: 16,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#222222',
  },
  noticeContainer: {
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  bottomSafeArea: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    gap: 10,
    padding: 16,
    paddingBottom: 25,
  },
  cancelContainer: {
    borderWidth: 1,
    borderColor: '#FF5959',
    borderRadius: 15,
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5959',
    textAlign: 'center',
  },
});
