import { ThemedText } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ticket } from '@/types/ticket';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import {
  Calendar,
  MapPin,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onPress }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasVC] = useState(ticket.status === 'active'); // VC 보유 여부 (임시로 active 상태로 판단)

  const cardBgColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1E2022' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E9F0', dark: '#2C3235' },
    'text',
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(ticket);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBgColor, borderColor }]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* 이미지가 메인인 카드 디자인 */}
      <View style={styles.imageContainer}>
        {ticket.image && (
          <Image source={{ uri: ticket.image }} style={styles.image} />
        )}

        {/* VC 배지 오버레이 */}
        <View style={styles.vcBadgeOverlay}>
          <View
            style={[
              styles.vcBadge,
              hasVC ? styles.vcActive : styles.vcInactive,
            ]}
          >
            {hasVC && (
              <Shield size={10} color={hasVC ? '#FFFFFF' : '#9CA3AF'} />
            )}
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.vcBadgeText,
                hasVC ? styles.vcActiveText : styles.vcInactiveText,
              ]}
            >
              {hasVC ? '발급완료' : '미발급'}
            </ThemedText>
          </View>
        </View>

        {/* 확장/축소 버튼 */}
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          {isExpanded ? (
            <ChevronUp size={20} color="#FFFFFF" />
          ) : (
            <ChevronDown size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* 기본 정보 */}
      <View style={styles.infoContainer}>
        <ThemedText type="subtitle" numberOfLines={2}>
          {ticket.title}
        </ThemedText>

        <View>
          <View style={styles.infoItem}>
            <MapPin size={14} color="#646568" />
            <ThemedText
              type="defaultSemiBold"
              style={styles.infoText}
              numberOfLines={1}
            >
              {ticket.location}
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={14} color="#646568" />
            <ThemedText
              type="defaultSemiBold"
              style={styles.infoText}
              numberOfLines={1}
            >
              {ticket.date}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* 확장된 정보 (VC가 있을 때만) */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.issuerContainer}>
            <ThemedText style={styles.issuer}>{ticket.tenantName}</ThemedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vcBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  vcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  vcActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
  },
  vcInactive: {
    backgroundColor: 'rgba(156, 163, 175, 0.9)',
  },
  vcBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  vcActiveText: {
    color: '#FFFFFF',
  },
  vcInactiveText: {
    color: '#FFFFFF',
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  issuerContainer: {
    alignItems: 'center',
  },
  issuer: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
