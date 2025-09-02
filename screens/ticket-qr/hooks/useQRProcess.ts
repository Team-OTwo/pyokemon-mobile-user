import {useEffect, useState} from 'react';
import {getDetailTicket} from '../../../services/apis/ticket';
import type {Ticket, TicketDetail} from '../../../types/ticket';
import {SAMPLE_TICKET_DETAILS} from '../../../data/ticket_detail';
import {generateProof, signDidToJwt} from '../../../services/did/credo';
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
  const agent = useAgent();

  // 티켓 정보 로드
  useEffect(() => {
    const getTicket = async () => {
      const ticket = await getDetailTicket(bookingId);
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

      const result = await signDidToJwt(agent, publicDid, ticketData.bookingId);

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

    const entryId = `entry_${ticket.bookingId}_${venueCode}_${Date.now()}`;
    const entryData: EntryData = {
      entryId: entryId,
      ticketId: ticket.bookingId,
      venueCode: venueCode,
      timestamp: Date.now(),
      type: 'venue',
      signature: `entry_${ticket.bookingId}_${venueCode}_${Date.now()}`,
    };

    const entryQRString = JSON.stringify(entryData);
    console.log('venue entryQRString', entryQRString);
    setEntryQRData(entryQRString);
    setEntryId(entryId);
    setCurrentStep(QRStep.GENERATE_ENTRY_QR);
  };

  const handleVenueQRScanned = (data: string) => {
    try {
      // 실제로는 서버에서 검증해야 함
      const scannedData = JSON.parse(data);
      if (scannedData.type === 'venue') {
        setVenueCode(scannedData.venueCode);
        generateEntryQR(scannedData.venueCode);
      } else {
        throw new Error('Invalid venue QR');
      }
    } catch (error) {
      // 단순 문자열인 경우 (테스트용)
      setVenueCode(data);
      generateEntryQR(data);
    }
  };

  const proceedToScan = () => {
    setCurrentStep(QRStep.SCAN_VENUE_QR);
  };

  const resetToScanVenue = () => {
    setCurrentStep(QRStep.SCAN_VENUE_QR);
    setVenueCode(null);
    setEntryQRData(null);
    setEntryId(null);
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
    handleVenueQRScanned,
    proceedToScan,
    resetToScanVenue,
    completeEntry,
  };
}
