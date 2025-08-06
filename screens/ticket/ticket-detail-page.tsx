import { AuthButton } from '@/components/auth';
import { ThemedText, ThemedView } from '@/components/common';
import { SAMPLE_TICKETS } from '@/data/ticket';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootStackParamList } from '@/types/navigation';
import {
  getStatusColor,
  getStatusText,
  getTypeColor,
} from '@/utils/ticket.utils';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle, ChevronLeft, CircleX } from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type TicketDetailProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TicketDetail'>;
  route: RouteProp<RootStackParamList, 'TicketDetail'>;
};

export default function TicketDetail({ navigation, route }: TicketDetailProps) {
  const { ticketId } = route.params;
  const [vc, setVc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ticket = SAMPLE_TICKETS.find(ticket => ticket.id === ticketId);
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
    console.log('QR 생성');
    navigation.navigate('TicketQR', { ticketId });
  };

  if (!ticket) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>티켓 상세</ThemedText>
            <View style={styles.placeholder} />
          </View>
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
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>티켓 상세</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.ticketContainer}>
            {/* 티켓 상태 및 타입 */}
            <View style={styles.statusContainer}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.statusText,
                  { color: getStatusColor(ticket.status).textColor },
                ]}
              >
                {getStatusText(ticket.status)}
              </ThemedText>
              {ticket.status === 'active' && (
                <CheckCircle
                  size={18}
                  color={getStatusColor(ticket.status).textColor}
                />
              )}
              {(ticket.status === 'expired' ||
                ticket.status === 'cancelled') && (
                <CircleX
                  size={18}
                  color={getStatusColor(ticket.status).textColor}
                />
              )}
            </View>

            {/* 티켓 제목 */}
            <ThemedText style={styles.ticketTitle}>{ticket.title}</ThemedText>

            {/* 티켓 정보 */}
            <View style={[styles.infoCard, { borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  일시
                </ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.date}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  장소
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.location}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  좌석
                </ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.seat}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText type="subtitle" style={styles.infoLabel}>
                  발급처
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {ticket.issuer}
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
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.buttonContainer}>
            {vc ? (
              <AuthButton
                title="QR 생성"
                onPress={handleGenerateQR}
                disabled={ticket.status !== 'active'}
              />
            ) : (
              <AuthButton
                isLoading={isLoading}
                title="VC 요청"
                onPress={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    setVc(true);
                  }, 1000);
                }}
                disabled={ticket.status !== 'active'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 24,
    marginVertical: 10,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: 60,
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.5,
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
  disabledButton: {
    opacity: 0.6,
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
