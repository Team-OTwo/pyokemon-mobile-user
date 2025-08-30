import React from 'react';
import {AuthButton} from '../../../components/auth';
import {ThemedText} from '../../../components/common';
import type {TicketDetail} from '../../../types/ticket';

import {StackNavigationProp} from '@react-navigation/stack';
import {CheckCircle} from 'lucide-react-native';
import {SafeAreaView, StyleSheet, View} from 'react-native';

interface EntryCompleteProps {
  ticket: TicketDetail;
  onReset: () => void;
  navigation: StackNavigationProp<any>;
}

export default function EntryComplete({
  ticket,
  onReset,
  navigation,
}: EntryCompleteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.successIcon}>
        <CheckCircle size={80} color="#4CAF50" />
      </View>

      <ThemedText style={styles.completeTitle}>
        입장이 완료되었습니다!
      </ThemedText>

      <View style={styles.ticketInfoContainer}>
        <ThemedText style={styles.ticketInfoTitle}>티켓 정보</ThemedText>
        <View style={styles.ticketInfoRow}>
          <ThemedText style={styles.ticketInfoLabel}>공연명:</ThemedText>
          <ThemedText style={styles.ticketInfoValue}>
            {ticket.event.title}
          </ThemedText>
        </View>
        <View style={styles.ticketInfoRow}>
          <ThemedText style={styles.ticketInfoLabel}>날짜:</ThemedText>
          <ThemedText style={styles.ticketInfoValue}>
            {ticket.event.eventDate}
          </ThemedText>
        </View>
        <View style={styles.ticketInfoRow}>
          <ThemedText style={styles.ticketInfoLabel}>장소:</ThemedText>
          <ThemedText style={styles.ticketInfoValue}>
            {ticket.event.venue.name}
          </ThemedText>
        </View>
        <View style={styles.ticketInfoRow}>
          <ThemedText style={styles.ticketInfoLabel}>좌석:</ThemedText>
          <ThemedText style={styles.ticketInfoValue}>
            {ticket.seat.className}-{ticket.seat.floor}-{ticket.seat.row}-
            {ticket.seat.col}
          </ThemedText>
        </View>
      </View>

      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.buttonContainer}>
          <AuthButton
            title="홈으로 돌아가기"
            onPress={() => navigation.replace('Home')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#4CAF50',
  },
  ticketInfoContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 32,
  },
  ticketInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  ticketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  ticketInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
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
  bottomSafeArea: {
    backgroundColor: 'transparent',
    width: '100%',
  },
});
