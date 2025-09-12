import React, {useState, useRef, useEffect, useCallback} from 'react';
import {AuthButton} from '../../components/auth';
import {ThemedText, ThemedView} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';

// Components
import PageHeader from '../../components/ui/header';
import EntryComplete from './_components/entry-complete';
import QRDisplay from './_components/qr-display';
import QRScanner from './_components/qr-scanner';
import TestButton from './_components/test-button';

// Hooks
import {useCameraPermission} from './hooks/useCameraPermission';
import {QRStep, useQRProcess} from './hooks/useQRProcess';
import {MainStackParamList} from '../../types/navigation';
import {useAgentStatus} from '../../contexts/agent-provider';
import {ProofEventTypes, ProofState} from '@credo-ts/core';

type TicketQRScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'TicketQR'>;
  route: RouteProp<MainStackParamList, 'TicketQR'>;
};

export default function TicketQRPage({navigation, route}: TicketQRScreenProps) {
  const {bookingId} = route.params;
  const {hasPermission} = useCameraPermission();
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [agentConnectionId, setAgentConnectionId] = useState<string | null>(
    null,
  );
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const {agent} = useAgentStatus();

  const {
    loading,
    ticket,
    currentStep,
    entryQRData,
    connectionStatus,
    handleVenueQRScanned,
    proceedToScan,
    resetToScanVenue,
    completeEntry,
  } = useQRProcess(bookingId);

  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );
  const textColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');

  const handleTestGenerateQR = () => {
    if (!ticket) return;
    const testVenueCode = `venue_${Date.now()}`;
    handleVenueQRScanned(
      JSON.stringify({type: 'venue', venueCode: testVenueCode}),
    );
  };

  const handleEntryComplete = () => {
    // 테스트용: 바로 입장 완료로 이동
    if (entryQRData) {
      // 실제로는 서버에 입장 완료 요청
      console.log('입장 완료');
      completeEntry();
    }
  };

  // Agent 이벤트 리스너 설정
  useEffect(() => {
    if (!agent) return;

    const handleProofStateChanged = ({payload}: any) => {
      if (payload.proofRecord.state === ProofState.Done) {
        console.log('🎉 최종 인증 성공!');
        handleEntryComplete();
        // 인증 성공 시 추가 로직
      }
    };

    // 이벤트 리스너 등록
    agent.events.on(ProofEventTypes.ProofStateChanged, handleProofStateChanged);

    // 클린업 함수
    return () => {
      agent.events.off(
        ProofEventTypes.ProofStateChanged,
        handleProofStateChanged,
      );
    };
  }, [agent]);

  // Agent 연결 애니메이션 관리
  const startAgentAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [progressAnimation]);

  const stopAgentAnimation = useCallback(() => {
    progressAnimation.stopAnimation();
  }, [progressAnimation]);

  // Agent 연결 처리
  const handleAgentConnection = useCallback(
    async (qrData: string) => {
      if (!agent) {
        throw new Error('Agent가 초기화되지 않았습니다.');
      }

      setIsAgentLoading(true);
      startAgentAnimation();

      try {
        console.log('티켓입장 시도 중...');
        console.log('Agent 연결 시도 중...');

        const result = await agent.oob.receiveInvitationFromUrl(qrData, {
          autoAcceptInvitation: true,
          autoAcceptConnection: true,
        });

        console.log('Agent 연결 결과:', result);
        setAgentConnectionId(result.connectionRecord?.id || null);
        await new Promise(resolve => setTimeout(resolve, 3000));

        return true;
      } catch (error) {
        console.error('Agent 연결 실패:', error);
        throw error;
      } finally {
        setIsAgentLoading(false);
        stopAgentAnimation();
      }
    },
    [agent, startAgentAnimation, stopAgentAnimation],
  );

  const handleVenueQRScannedWithAgent = async (qrData: string) => {
    if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
      try {
        await handleAgentConnection(qrData);
        // Agent 연결 성공 시 추가 처리
        console.log('Agent 연결 성공');
        handleEntryComplete();
      } catch (error) {
        console.error('Agent 연결 실패, 일반 처리로 전환:', error);
        // Agent 연결 실패 시 일반 처리로 전환
        handleVenueQRScanned(qrData);
      }
    } else {
      // URL이 아닌 경우 바로 처리
      handleVenueQRScanned(qrData);
    }
  };
  // Agent 연결 로딩 상태
  if (isAgentLoading) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.agentLoadingContainer}>
            <View style={styles.ticketIcon}>
              <ThemedText style={styles.ticketIconText}>🎫</ThemedText>
            </View>
            <ThemedText style={styles.agentLoadingTitle}>
              티켓 입장 확인중
            </ThemedText>
            <ThemedText style={styles.agentLoadingSubtitle}>
              잠시만 기다려주세요...
            </ThemedText>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.agentLoadingStep}>
              Agent 연결 중...
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>
              티켓 정보를 불러오는 중...
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 티켓 없음
  if (!ticket) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <PageHeader title="입장 QR" onBackPress={() => navigation.goBack()} />
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

  // 카메라 권한 없음
  if (!hasPermission) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <PageHeader title="입장 QR" onBackPress={() => navigation.goBack()} />
          <View style={styles.notFoundContainer}>
            <ThemedText style={styles.notFoundText}>
              카메라 접근 권한이 필요합니다.
            </ThemedText>
            <AuthButton title="돌아가기" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        {currentStep === QRStep.SHOW_ENTRY_QR && entryQRData && (
          <>
            <PageHeader
              title="입장 QR"
              onBackPress={() => navigation.goBack()}
            />
            <QRDisplay
              qrData={entryQRData}
              title="입장용 QR 코드"
              infoText="• 입장 시 게이트 담당자에게 보여주세요.\n• QR을 보여준 후 게이트 스캔을 진행하세요.\n• 게이트 스캔 후 자동으로 입장이 완료됩니다."
              showTimer={true}
              onTimeExpired={proceedToScan}
            />
            <View style={styles.buttonContainer}>
              <AuthButton title="게이트 스캔하기" onPress={proceedToScan} />
            </View>
          </>
        )}

        {currentStep === QRStep.SCAN_VENUE_QR && (
          <>
            <PageHeader
              title="입장 게이트 스캔"
              onBackPress={() => navigation.goBack()}
            />
            <QRScanner onQRScanned={handleVenueQRScannedWithAgent} />
            {connectionStatus && (
              <View style={styles.connectionStatusContainer}>
                <ThemedText style={styles.connectionStatusText}>
                  {connectionStatus}
                </ThemedText>
              </View>
            )}
          </>
        )}

        {currentStep === QRStep.GENERATE_ENTRY_QR && entryQRData && (
          <>
            <PageHeader
              title="입장 QR"
              onBackPress={() => navigation.goBack()}
            />
            <QRDisplay
              qrData={entryQRData}
              title="입장용 QR 코드"
              infoText="• 게이트 담당자가 QR을 스캔하면 자동으로 입장이 완료됩니다.\n• 입장 완료 시 자동으로 다음 화면으로 이동합니다.\n• 문제가 있으면 다시 스캔하기를 눌러주세요."
              showTimer={true}
              onTimeExpired={resetToScanVenue}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={resetToScanVenue}>
                <ThemedText style={styles.secondaryButtonText}>
                  다시 스캔하기
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}

        {currentStep === QRStep.ENTRY_COMPLETE && ticket && (
          <>
            <PageHeader
              title="입장 완료"
              onBackPress={() => navigation.goBack()}
            />
            <EntryComplete
              ticket={ticket}
              onReset={resetToScanVenue}
              navigation={navigation}
            />
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  connectionStatusContainer: {
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  connectionStatusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  agentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  ticketIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  ticketIconText: {
    fontSize: 40,
  },
  agentLoadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  agentLoadingSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  agentLoadingStep: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
