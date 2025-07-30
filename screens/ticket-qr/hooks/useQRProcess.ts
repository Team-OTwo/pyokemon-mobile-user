import { SAMPLE_TICKETS } from "@/data/ticket";
import { Ticket } from "@/types/ticket";
import { useEffect, useState } from "react";

export enum QRStep {
  SCAN_VENUE_QR = "SCAN_VENUE_QR",
  GENERATE_ENTRY_QR = "GENERATE_ENTRY_QR",
  ENTRY_COMPLETE = "ENTRY_COMPLETE",
}

export interface EntryData {
  entryId: string;
  ticketId: string;
  venueCode: string;
  timestamp: number;
  type: string;
  signature: string;
}

export function useQRProcess(ticketId: string) {
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket | undefined>();
  const [currentStep, setCurrentStep] = useState<QRStep>(QRStep.SCAN_VENUE_QR);
  const [venueCode, setVenueCode] = useState<string | null>(null);
  const [entryQRData, setEntryQRData] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  // 티켓 정보 로드
  useEffect(() => {
    const fetchTicket = async () => {
      const ticket = SAMPLE_TICKETS.find((ticket) => ticket.id === ticketId);
      setTicket(ticket);
      setLoading(false);
    };
    fetchTicket();
  }, [ticketId]);

  const generateEntryQR = (venueCode: string) => {
    if (!ticket) return;

    const entryId = `entry_${ticket.id}_${venueCode}_${Date.now()}`;
    const entryData: EntryData = {
      entryId: entryId,
      ticketId: ticket.id,
      venueCode: venueCode,
      timestamp: Date.now(),
      type: "venue",
      signature: `entry_${ticket.id}_${venueCode}_${Date.now()}`,
    };

    const entryQRString = JSON.stringify(entryData);
    setEntryQRData(entryQRString);
    setEntryId(entryId);
    setCurrentStep(QRStep.GENERATE_ENTRY_QR);
  };

  const handleVenueQRScanned = (data: string) => {
    try {
      // 실제로는 서버에서 검증해야 함
      const scannedData = JSON.parse(data);
      if (scannedData.type === "venue") {
        setVenueCode(scannedData.venueCode);
        generateEntryQR(scannedData.venueCode);
      } else {
        throw new Error("Invalid venue QR");
      }
    } catch (error) {
      // 단순 문자열인 경우 (테스트용)
      setVenueCode(data);
      generateEntryQR(data);
    }
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
    resetToScanVenue,
    completeEntry,
  };
}
