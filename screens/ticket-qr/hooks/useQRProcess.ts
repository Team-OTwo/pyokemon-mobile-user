import {useEffect, useState} from 'react';
import {getDetailTicket} from '../../../services/apis/ticket';
import type {TicketDetail} from '../../../types/ticket';
import {signDidToJwt} from '../../../services/did/credo';
import {useAgent} from '../../../contexts/agent-provider';
import {getWalletInfo} from '../../../services/storage/walletStorage';

export enum QRStep {
  SHOW_ENTRY_QR = 'SHOW_ENTRY_QR',
  SCAN_VENUE_QR = 'SCAN_VENUE_QR',
  GENERATE_ENTRY_QR = 'GENERATE_ENTRY_QR',
  ENTRY_COMPLETE = 'ENTRY_COMPLETE',
}

export interface EntryData {
  entryId: string;
  ticketId: string;
  venueCode: string;
  timestamp: number;
  type: string;
  signature: string;
}

export function useQRProcess(bookingId: string) {
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketDetail | undefined>();
  const [currentStep, setCurrentStep] = useState<QRStep>(QRStep.SHOW_ENTRY_QR);
  const [venueCode, setVenueCode] = useState<string | null>(null);
  const [entryQRData, setEntryQRData] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const agent = useAgent();

  // 티켓 정보 로드
  useEffect(() => {
    const getTicket = async () => {
      const ticket = await getDetailTicket(bookingId);
      // const ticket = SAMPLE_TICKET_DETAILS;
      setTicket(ticket);
      setLoading(false);

      // 티켓 로드 후 자동으로 QR 생성
      if (ticket) {
        await generateInitialEntryQR(ticket);
      }
    };
    getTicket();
  }, [bookingId]);

  // 초기 QR 생성 (티켓 로드 시)
  const generateInitialEntryQR = async (ticketData: TicketDetail) => {
    try {
      // 저장된 지갑 정보에서 DID 공개키 가져오기
      const savedWalletInfo = await getWalletInfo();
      const publicDid = savedWalletInfo?.didPublicKey;

      if (!publicDid) {
        throw new Error('저장된 DID 공개키를 찾을 수 없습니다.');
      }

      // agent가 null일 수 있으므로 null 체크 추가
      if (!agent) {
        throw new Error('Agent가 초기화되지 않았습니다.');
      }

      const result = await signDidToJwt(agent, publicDid);

      // result.presentation 대신 result.jwt 사용 (presentation 속성 없음)
      if (result.success && result.jwt) {
        // booking_id와 jwt 형태로 QR 데이터 생성
        const entryQRString = JSON.stringify({
          booking_id: ticketData.bookingId,
          jwt: result.jwt,
        });

        console.log('✅ jwt 생성 성공, QR 업데이트:', entryQRString);
        setEntryQRData(entryQRString);
        setEntryId(entryId);
        setCurrentStep(QRStep.SHOW_ENTRY_QR);
      } else {
        throw new Error(result.message || 'VP 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ QR 생성 실패:', error);
    }
  };

  const generateEntryQR = (venueCode: string) => {
    if (!ticket) return;

    console.log(venueCode);

    const entryQRString = JSON.stringify({
      venueCode: venueCode,
    });
    console.log('venue entryQRString', entryQRString);
    setEntryQRData(entryQRString);
    setEntryId(entryId);
    setCurrentStep(QRStep.GENERATE_ENTRY_QR);
  };

  // invitation_url을 통한 agent 연결 시도
  const handleInvitationUrlConnection = async (invitationUrl: string) => {
    try {
      setConnectionStatus('연결 시도 중...');

      if (!agent) {
        throw new Error('Agent가 초기화되지 않았습니다.');
      }

      // venue invitation URL을 통한 연결 시도
      const {generateVenueConnection} = await import(
        '../../../services/did/credo'
      );

      console.log('🎯 Venue invitation URL로 연결 시도:', invitationUrl);

      const result = await generateVenueConnection(agent, invitationUrl);

      if (result.success && result.connectionRecord) {
        console.log('✅ Venue agent 연결 성공:', result.connectionRecord.id);
        setConnectionStatus('연결 성공!');

        // 연결 성공 후 venue 코드로 QR 생성
        const venueCode = `venue_${Date.now()}`;
        setVenueCode(venueCode);
        generateEntryQR(venueCode);

        return true;
      } else {
        throw new Error('Venue agent 연결에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ Venue agent 연결 실패:', error);
      setConnectionStatus('연결 실패');
      throw error;
    }
  };

  const handleVenueQRScanned = async (data: string) => {
    try {
      // invitation_url인지 확인
      // if (data.includes('invitation_url') || data.includes('http')) {
      //   console.log('🔗 Invitation URL 감지:', data);
      console.log('data', data);
      // let invitationUrl = data;

      // JSON 형태로 감싸져 있는 경우 파싱
      try {
        // const parsedData = JSON.parse(data);
        // if (parsedData.invitation_url) {
        //   invitationUrl = parsedData.invitation_url;
        // } else if (parsedData.url) {
        //   invitationUrl = parsedData.url;
        // }
      } catch (parseError) {
        // 파싱 실패 시 원본 데이터 사용
        console.log('JSON 파싱 실패, 원본 데이터 사용');
      }

      // agent 연결 시도
      // await handleInvitationUrlConnection(invitationUrl);
      // return;
      // }

      // 기존 venue QR 처리 로직
      //   const scannedData = JSON.parse(data);
      //   if (scannedData.type === 'venue') {
      //     setVenueCode(scannedData.venueCode);
      //     generateEntryQR(scannedData.venueCode);
      //   } else {
      //     throw new Error('Invalid venue QR');
      //   }
      // } catch (error) {
      //   // 단순 문자열인 경우 (테스트용)
      //   console.log('단순 문자열 처리:', data);
      //   setVenueCode(data);
      //   generateEntryQR(data);
      // }
    } catch (error) {
      console.error('❌ Venue QR 처리 실패:', error);
    }
  };

  const proceedToScan = () => {
    console.log('proceedToScan');
    setCurrentStep(QRStep.SCAN_VENUE_QR);
  };

  const resetToScanVenue = () => {
    setCurrentStep(QRStep.SCAN_VENUE_QR);
    setVenueCode(null);
    setEntryQRData(null);
    setEntryId(null);
    setConnectionStatus('');
  };

  const completeEntry = () => {
    setCurrentStep(QRStep.ENTRY_COMPLETE);
  };

  return {
    loading,
    ticket,
    currentStep,
    venueCode,
    entryQRData,
    connectionStatus,
    handleVenueQRScanned,
    proceedToScan,
    resetToScanVenue,
    completeEntry,
  };
}
