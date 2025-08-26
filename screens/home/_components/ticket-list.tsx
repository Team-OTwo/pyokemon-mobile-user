import { ThemedText } from '@/components/common';
import { useThemeColor } from '@/hooks';
import { TicketCard } from '@/screens/home/_components/ticket-card';
import { Ticket } from '@/types/ticket';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface TicketListProps {
  tickets: Ticket[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onTicketPress?: (ticket: Ticket) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onGenreChange?: (genre: string | null) => void;
  refreshing?: boolean;
}

// 장르 필터 옵션
const GENRE_FILTERS = [
  { label: '전체', value: null },
  { label: '콘서트', value: 'concert' },
  { label: '뮤지컬', value: 'musical' },
  { label: '연극', value: 'play' },
  { label: '전시', value: 'exhibition' },
  { label: '스포츠', value: 'sports' },
];

export function TicketList({
  tickets,
  isLoading,
  isLoadingMore,
  hasMore,
  onTicketPress,
  onRefresh,
  onLoadMore,
  onGenreChange,
  refreshing,
}: TicketListProps) {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

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

  const handleGenreFilter = (genre: string | null) => {
    setActiveGenre(genre);
    onGenreChange?.(genre);
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      onLoadMore?.();
    }
  };

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
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={GENRE_FILTERS}
          keyExtractor={item => item.label}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeGenre === item.value && { backgroundColor: tintColor },
              ]}
              onPress={() => handleGenreFilter(item.value)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeGenre === item.value && { color: '#ffffff' },
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
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
        onEndReachedThreshold={0.1}
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
  filterContainer: {
    paddingVertical: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterText: {
    fontSize: 16,
    color: '#646568',
    fontWeight: 'bold',
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
