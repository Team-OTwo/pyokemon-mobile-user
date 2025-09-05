import {ThemedText, ThemedView} from '../../components/common';
import {
  useThemeColor,
  useNotificationPagination,
  useNotification,
} from '../../hooks';
import {MainStackParamList} from '../../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import NotificationItem from '../../screens/notification/_components/notification-item';
import PageHeader from '../../components/ui/header';
import Loading from '../../components/ui/loading';
import {
  getNotifications,
  readNotification,
} from '../../services/apis/notification';

type NotificationProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Notification'>;
};

// API 호출 함수
const fetchNotifications = async (cursor?: number | null) => {
  try {
    const response = await getNotifications(cursor);
    return {
      notifications: response.notifications || [],
      next_cursor: response.next_cursor || null,
      hasMore: response.hasMore || false,
    };
  } catch (error) {
    console.error('알림 조회 실패:', error);
    // 에러 발생 시 빈 응답 반환
    return {
      notifications: [],
      next_cursor: null,
      hasMore: false,
    };
  }
};

export default function Notification({navigation}: NotificationProps) {
  const {setUnreadCount} = useNotification();

  const {
    notifications,
    isLoading,
    isLoadingMore,
    refreshing,
    hasMore,
    loadInitialNotifications,
    loadMoreNotifications,
    refreshNotifications,
    markAsRead,
  } = useNotificationPagination({
    onLoadMore: fetchNotifications,
    onUnreadCountChange: setUnreadCount,
  });

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMoreNotifications();
    }
  };

  const handleReadNotification = async (notificationId: string) => {
    try {
      // API 호출
      await readNotification(notificationId);
      // 로컬 상태 업데이트 (즉시 반영)
      markAsRead(notificationId);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };
  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialNotifications();
  }, [loadInitialNotifications]);

  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );
  const tintColor = useThemeColor({light: '#2E5BFF', dark: '#2E5BFF'}, 'tint');
  const textColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');
  const borderColor = useThemeColor(
    {light: '#E5E9F0', dark: '#2C3235'},
    'text',
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, {backgroundColor}]}>
        <StatusBar barStyle="default" />
        <SafeAreaView style={styles.safeArea}>
          <PageHeader title="알림" onBackPress={() => navigation.goBack()} />
          <Loading message="알림을 불러오는 중..." />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <PageHeader title="알림" onBackPress={() => navigation.goBack()} />
        <View style={styles.content}>
          <FlatList
            onRefresh={handleRefresh}
            refreshing={refreshing}
            data={notifications}
            renderItem={({item}) => (
              <NotificationItem
                notification={item}
                onPress={() => {
                  if (!item.isChecked) {
                    handleReadNotification(item.notificationId);
                  }
                }}
              />
            )}
            keyExtractor={item => item.notificationId}
            style={styles.list}
            onEndReached={handleLoadMore}
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  알림이 없습니다.
                </ThemedText>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  list: {
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
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
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
});
