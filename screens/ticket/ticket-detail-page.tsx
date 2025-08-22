import { AuthButton } from '@/components/auth';
import { ThemedText, ThemedView } from '@/components/common';
import PageHeader from '@/components/ui/header';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getDetailTicket } from '@/services/apis/ticket';
import { MainStackParamList } from '@/types/navigation';
import type { TicketDetail } from '@/types/ticket';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useRef, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from 'react-native';

type TicketDetailProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'TicketDetail'>;
  route: RouteProp<MainStackParamList, 'TicketDetail'>;
};

export default function TicketDetail({ navigation, route }: TicketDetailProps) {
  const { ticketId } = route.params;
  const [vc, setVc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVc, setIsVc] = useState(false);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 티켓 데이터 페칭
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const ticketData = await getDetailTicket(ticketId);
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
  }, [ticketId]);

  // 애니메이션 값들
  const scrollY = useRef(new Animated.Value(0)).current;
  const imageHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [250, 120],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1E2022' },
    'background',
  );
  const textColor = useThemeColor(
    { light: '#000000', dark: '#FFFFFF' },
    'text',
  );
  const borderColor = useThemeColor(
    { light: '#DDDDDB', dark: '#2C3235' },
    'text',
  );

  const handleGenerateQR = () => {
    navigation.navigate('TicketQR', {
      ticketId: ticket?.bookingId || '',
    });
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
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
      <ThemedView style={[styles.container, { backgroundColor }]}>
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
      <ThemedView style={[styles.container, { backgroundColor }]}>
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
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* <StatusBar barStyle="default" /> */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        >
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
                ]}
              >
                <Image
                  source={{ uri: ticket.event.thumbnailUrl }}
                  style={styles.thumbnail}
                />
              </Animated.View>
            )}

            {/* 티켓 제목 */}
            <ThemedText style={styles.ticketTitle}>
              {ticket.event.title}
            </ThemedText>

            {/* 티켓 정보 */}
            <View style={[styles.infoCard, { borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  일시
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.event.eventDate}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  장소
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.event.venue.name}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  좌석
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.seat.className}-{ticket.seat.floor}-{ticket.seat.row}-
                  {ticket.seat.col}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  발급처
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.tenantName}
                </ThemedText>
              </View>
            </View>

            {/* 안내 사항 */}
            <View style={styles.noticeContainer}>
              <ThemedText style={styles.noticeTitle}>입장 안내</ThemedText>
              <ThemedText style={styles.noticeText}>
                • 입장 시 QR 코드를 생성하여 게이트에서 스캔해주세요.{'\n'}• QR
                코드는 생성 후 3분간 유효합니다.{'\n'}• 입장 후에는 티켓 상태가
                (사용됨) 으로 변경됩니다.{'\n'}• 한 번 사용된 티켓은 재사용이
                불가능합니다.
              </ThemedText>
            </View>
          </View>
        </Animated.ScrollView>

        {/* 하단 버튼 영역 */}
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.buttonContainer}>
            {vc ? (
              <AuthButton
                title="QR 생성"
                onPress={handleGenerateQR}
                // disabled={ticket.status !== 'active'}
              />
            ) : (
              <AuthButton
                isLoading={isVc}
                title="VC 요청"
                onPress={() => {
                  setIsVc(true);
                  setTimeout(() => {
                    setIsVc(false);
                    setVc(true);
                  }, 1000);
                }}
                // disabled={ticket.status !== 'active'}
              />
            )}
            <TouchableOpacity style={styles.cancelContainer}>
              <ThemedText style={styles.cancelText}>예매취소</ThemedText>
            </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontWeight: '600',
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
    paddingBottom: Platform.OS === 'android' ? 25 : 16,
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
