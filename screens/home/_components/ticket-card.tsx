import {ThemedText} from '../../../components/common';
import {useThemeColor} from '../../../hooks/useThemeColor';
import {Ticket} from '../../../types/ticket';
import React from 'react';
import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import {Calendar, MapPin, Shield} from 'lucide-react-native';
import {formatDate} from '../../../utils/format.utils';

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
}

export function TicketCard({ticket, onPress}: TicketCardProps) {
  const cardBgColor = useThemeColor(
    {light: '#FFFFFF', dark: '#1E2022'},
    'background',
  );

  const handleCardPress = () => {
    if (onPress) {
      onPress(ticket);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: cardBgColor}]}
      onPress={handleCardPress}
      activeOpacity={0.7}>
      {/* 이미지가 메인인 카드 디자인 */}
      <View style={styles.imageContainer}>
        {ticket.thumbnailUrl && (
          <Image source={{uri: ticket.thumbnailUrl}} style={styles.image} />
        )}

        {/* VC 배지 오버레이 */}
        <View style={styles.vcBadgeOverlay}>
          {/* <View
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
          </View> */}
        </View>
      </View>

      {/* 기본 정보 */}
      <View style={styles.infoContainer}>
        <ThemedText type="subtitle" numberOfLines={2}>
          {ticket.eventTitle}
        </ThemedText>

        <View>
          <View style={styles.infoItem}>
            <MapPin size={14} color="#646568" />
            <ThemedText
              type="defaultSemiBold"
              style={styles.infoText}
              numberOfLines={1}>
              {ticket.venueName}
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={14} color="#646568" />
            <ThemedText
              type="defaultSemiBold"
              style={styles.infoText}
              numberOfLines={1}>
              {formatDate(ticket.eventDate)}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
});
