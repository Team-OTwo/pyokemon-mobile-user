import { useState, useCallback, useEffect } from 'react';
import {
  Notification,
  NotificationPaginationResponse,
} from '@/types/notification';

export interface UseNotificationPaginationProps {
  onLoadMore: (
    cursor?: number | null,
  ) => Promise<NotificationPaginationResponse>;
  onUnreadCountChange?: (count: number) => void;
}

export const useNotificationPagination = ({
  onLoadMore,
  onUnreadCountChange,
}: UseNotificationPaginationProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadInitialNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await onLoadMore(null);

      setNotifications(response.notifications);
      setNextCursor(response.next_cursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('초기 알림 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    // nextCursor가 유효한 숫자인지 확인
    if (
      typeof nextCursor !== 'number' ||
      isNaN(nextCursor) ||
      nextCursor <= 0
    ) {
      console.error('유효하지 않은 cursor 값:', nextCursor);
      return;
    }

    try {
      setIsLoadingMore(true);

      const response = await onLoadMore(nextCursor);

      setNotifications(prev => [...prev, ...response.notifications]);
      setNextCursor(response.next_cursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('추가 알림 로딩 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor, onLoadMore]);

  const refreshNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadInitialNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialNotifications]);

  // 알림 읽음 처리 (로컬 상태만 업데이트)
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.notificationId === notificationId
          ? { ...notification, isChecked: true }
          : notification,
      ),
    );
  }, []);

  // 안 읽은 알림 개수 계산 및 콜백 호출
  useEffect(() => {
    if (onUnreadCountChange) {
      const unreadCount = notifications.filter(n => !n.isChecked).length;
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

  return {
    notifications,
    isLoading,
    isLoadingMore,
    refreshing,
    hasMore,
    loadInitialNotifications,
    loadMoreNotifications,
    refreshNotifications,
    markAsRead,
  };
};
