import { ThemedText } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ticket } from '@/types/ticket';
import {
  getStatusColor,
  getStatusText,
  getTicketFilters,
  getTypeColor,
} from '@/utils/ticket.utils';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, CheckCircle, CircleX, MapPin } from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
  onVCStatusChange?: () => void;
}

export function TicketCard({
  ticket,
  onPress,
  onVCStatusChange,
}: TicketCardProps) {
  const cardBgColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1E2022' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E9F0', dark: '#2C3235' },
    'text',
  );

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => onPress && onPress(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>{ticket.title}</ThemedText>
        <View style={styles.statusContainer}>
          <ThemedText
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
          {(ticket.status === 'expired' || ticket.status === 'cancelled') && (
            <CircleX
              size={18}
              color={getStatusColor(ticket.status).textColor}
            />
          )}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#646568" />
          <ThemedText type="defaultSemiBold" style={styles.infoValue}>
            {ticket.location}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color="#646568" />
          <ThemedText type="defaultSemiBold" style={styles.infoValue}>
            {ticket.date}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    opacity: 0.7,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issuer: {
    fontSize: 12,
    opacity: 0.6,
  },
});
