import { useState, useCallback } from 'react';
import { Ticket } from '@/types/ticket';

export interface PaginationResponse {
  tickets: Ticket[];
  next_cursor: string | null;
  hasMore: boolean;
}

export interface UseTicketPaginationProps {
  onLoadMore: (cursor?: string, genre?: string) => Promise<PaginationResponse>;
}

export const useTicketPagination = ({
  onLoadMore,
}: UseTicketPaginationProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentGenre, setCurrentGenre] = useState<string | null>(null);

  const loadInitialTickets = useCallback(
    async (genre?: string) => {
      try {
        setIsLoading(true);
        setCurrentGenre(genre || null);

        const response = await onLoadMore(undefined, genre);

        setTickets(response.tickets);
        setNextCursor(response.next_cursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('초기 티켓 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onLoadMore],
  );

  const loadMoreTickets = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    try {
      setIsLoadingMore(true);

      const response = await onLoadMore(nextCursor, currentGenre || undefined);

      setTickets(prev => [...prev, ...response.tickets]);
      setNextCursor(response.next_cursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('추가 티켓 로딩 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor, currentGenre, onLoadMore]);

  const refreshTickets = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadInitialTickets(currentGenre || undefined);
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialTickets, currentGenre]);

  const changeGenre = useCallback(
    async (genre: string | null) => {
      if (genre === currentGenre) return;

      // 장르 변경 시 초기화
      setTickets([]);
      setNextCursor(null);
      setHasMore(true);

      await loadInitialTickets(genre || undefined);
    },
    [currentGenre, loadInitialTickets],
  );

  return {
    tickets,
    isLoading,
    isLoadingMore,
    refreshing,
    hasMore,
    currentGenre,
    loadInitialTickets,
    loadMoreTickets,
    refreshTickets,
    changeGenre,
  };
};
