import React from 'react';
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

type TicketQRScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'TicketQR'>;
  route: RouteProp<MainStackParamList, 'TicketQR'>;
};

export default function TicketQRPage({navigation, route}: TicketQRScreenProps) {
  const {bookingId} = route.params;
  const {hasPermission} = useCameraPermission();

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

  const handleTestEntryComplete = () => {
    // 테스트용: 바로 입장 완료로 이동
    if (entryQRData) {
      // 실제로는 서버에 입장 완료 요청
      // console.log('테스트: 입장 완료');
      completeEntry();
    }
  };
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
            <QRScanner onQRScanned={handleVenueQRScanned} />
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
            <TestButton
              title="테스트용: 입장 완료"
              onPress={handleTestEntryComplete}
            />
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
    paddingBottom: Platform.OS === 'android' ? 24 : 0,
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
});
