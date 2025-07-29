import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ticket } from "@/types/ticket";
import { getStatusColor, getStatusText, getTicketFilters, getTypeColor } from "@/utils/ticket.utils";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RequestVCButton } from "./RequestVCButton";

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
  onVCStatusChange?: () => void;
}

export function TicketCard({ ticket, onPress, onVCStatusChange }: TicketCardProps) {
  const [hasVC, setHasVC] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const cardBgColor = useThemeColor({ light: "#FFFFFF", dark: "#1E2022" }, "background");
  const borderColor = useThemeColor({ light: "#E5E9F0", dark: "#2C3235" }, "text");
  const vcStatusColor = hasVC
    ? { bgColor: "#E1F5E9", textColor: "#0C6B39" }
    : { bgColor: "#FEF3C7", textColor: "#B45309" };

  const statusColors = getStatusColor(ticket.status);

  const typeColor = getTypeColor(ticket.type);

  const handleRequestVC = async () => {
    setIsLoading(true);

    // 실제 구현에서는 API 호출로 VC 발급 요청
    // 여기서는 임시로 setTimeout으로 API 호출 시뮬레이션
    setTimeout(async () => {
      // 임시 VC 데이터 생성 (실제로는 API 응답으로 받음)
      // const mockVC = createVC(ticket, "did:example:user123");

      // VC 저장
      // await saveVC(mockVC);
      setIsLoading(false);
      // if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => onPress && onPress(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.typeTag, { backgroundColor: `${typeColor}20` }]}>
          <ThemedText style={[styles.typeText, { color: typeColor }]}>
            {getTicketFilters(ticket.type)?.label}
          </ThemedText>
        </View>
        <View style={[styles.statusTag, { backgroundColor: statusColors.bgColor }]}>
          <ThemedText style={[styles.statusText, { color: statusColors.textColor }]}>
            {getStatusText(ticket.status)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>{ticket.title}</ThemedText>

      <View>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>날짜</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.date}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>장소</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.location}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>좌석</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.seat}</ThemedText>
        </View>
      </View>

      {/* VC 상태 표시 */}
      <View>
        {/* {!isLoading && hasVC !== null && ( */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ThemedText style={styles.issuer}>발급처: {ticket.issuer}</ThemedText>
          {hasVC ? (
            <View style={[styles.vcStatusTag, { backgroundColor: vcStatusColor.bgColor }]}>
              <ThemedText style={[styles.vcStatusText, { color: vcStatusColor.textColor }]}>VC 발급됨</ThemedText>
            </View>
          ) : (
            <RequestVCButton ticket={ticket} onSuccess={handleRequestVC} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeTag: {
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusTag: {
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  vcStatusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  vcStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  issuer: {
    fontSize: 12,
    opacity: 0.6,
  },
});
