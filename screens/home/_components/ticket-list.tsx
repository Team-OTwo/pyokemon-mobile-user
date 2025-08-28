import { ThemedText } from '@/components/common';
import { useThemeColor } from '@/hooks';
import { TicketCard } from '@/screens/home/_components/ticket-card';
import { Ticket } from '@/types/ticket';
import React, { useState, useRef, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

interface TicketListProps {
  tickets: Ticket[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onTicketPress?: (ticket: Ticket) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  refreshing?: boolean;
}

export function TicketList({
  tickets,
  isLoading,
  isLoadingMore,
  hasMore,
  onTicketPress,
  onRefresh,
  onLoadMore,
  refreshing,
}: TicketListProps) {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const isEndReachedCalled = useRef<boolean>(false);

  const tintColor = useThemeColor(
    { light: '#75B8FF', dark: '#75B8FF' },
    'tint',
  );
  const backgroundColor = useThemeColor(
    { light: '#F5F7FA', dark: '#151718' },
    'background',
  );

  // VC 상태 변경 시 리스트 리렌더링
  const handleVCStatusChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // 더 불러오기 호출을 안전하게 처리
  const handleEndReached = useCallback(() => {
    if (isEndReachedCalled.current) return;

    if (hasMore && !isLoadingMore && onLoadMore) {
      isEndReachedCalled.current = true;
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // 스크롤 시작 시 endReached 플래그 리셋
  const handleScrollBeginDrag = useCallback(() => {
    isEndReachedCalled.current = false;
  }, []);

  // 스크롤 끝에 도달했을 때 endReached 플래그 리셋
  const handleMomentumScrollEnd = useCallback(() => {
    isEndReachedCalled.current = false;
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>
          티켓을 불러오는 중...
        </ThemedText>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor }]}>
        <ThemedText style={styles.emptyText}>
          예약된 티켓이 없습니다.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container} key={refreshKey}>
      <FlatList
        ref={flatListRef}
        data={tickets}
        keyExtractor={item => item.bookingId.toString()}
        renderItem={({ item }: any) => (
          <TicketCard
            ticket={item}
            onPress={onTicketPress}
            // onVCStatusChange={handleVCStatusChange}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing || false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={styles.loadingMoreText}>
                더 불러오는 중...
              </ThemedText>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
});
