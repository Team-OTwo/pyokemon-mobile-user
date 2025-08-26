import React from 'react';
import { ThemedText, ThemedView } from '@/components/common';
import { useThemeColor, useTicketPagination, useNotification } from '@/hooks';
import { MainStackParamList } from '@/types/navigation';
import { Ticket } from '@/types/ticket';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TicketList } from './_components/ticket-list';
import { Bell, User } from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import { SAMPLE_TICKETS } from '@/data/ticket';
import { getNotifications } from '@/services/apis/notification';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home'>;
};

// API 호출 함수 (실제 구현은 사용자가 할 예정)
const fetchTickets = async (cursor?: number, genre?: string) => {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/api/app/bookings/my-tickets?${cursor ? `cursor=${cursor}` : ''}${genre ? `&eventgenre=${genre}` : ''}`);
  // return response.json();

  // 임시 더미 데이터
  return {
    tickets: SAMPLE_TICKETS,
    next_cursor: null,
    hasMore: false,
  };
};

// 홈화면에서 안 읽은 알림 개수 가져오기
const fetchUnreadNotificationCount = async () => {
  try {
    const response = await getNotifications();
    const unreadCount = (response.notifications || []).filter(
      (n: any) => !n.isChecked,
    ).length;
    console.log('unreadCount', unreadCount);
    return unreadCount;
  } catch (error) {
    console.error('안 읽은 알림 개수 조회 실패:', error);
    return 0;
  }
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { unreadCount, setUnreadCount } = useNotification();

  const {
    tickets,
    isLoading,
    isLoadingMore,
    refreshing,
    hasMore,
    loadInitialTickets,
    loadMoreTickets,
    refreshTickets,
    changeGenre,
  } = useTicketPagination({
    onLoadMore: fetchTickets,
  });

  const handleTicketPress = (ticket: Ticket) => {
    navigation.navigate('TicketDetail', {
      ticketId: ticket.bookingId.toString(),
    });
  };

  const handleRefresh = () => {
    refreshTickets();
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMoreTickets();
    }
  };

  const handleGenreChange = (genre: string | null) => {
    changeGenre(genre);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialTickets();
  }, [loadInitialTickets]);

  // 홈화면에 포커스가 올 때마다 안 읽은 알림 개수 업데이트
  useFocusEffect(
    React.useCallback(() => {
      const loadUnreadCount = async () => {
        const count = await fetchUnreadNotificationCount();
        setUnreadCount(count);
      };
      loadUnreadCount();
    }, [setUnreadCount]),
  );

  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.welcomeText}>내 티켓</ThemedText>
          <View style={styles.userIcon}>
            <View style={styles.bellContainer}>
              <Bell
                size={23}
                color={textColor}
                onPress={() => {
                  navigation.navigate('Notification');
                }}
              />
              <Badge count={unreadCount} size="small" />
            </View>
            <User
              size={25}
              color={textColor}
              onPress={() => {
                navigation.navigate('Profile');
              }}
            />
          </View>
        </View>

        <View style={styles.content}>
          <TicketList
            tickets={tickets}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onTicketPress={handleTicketPress}
            onRefresh={handleRefresh}
            onLoadMore={handleLoadMore}
            onGenreChange={handleGenreChange}
            refreshing={refreshing}
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: 'transparent',
  },
  userIcon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  bellContainer: {
    position: 'relative',
  },
});
