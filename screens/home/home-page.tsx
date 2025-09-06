import React from 'react';
import {useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {SafeAreaView, StatusBar, StyleSheet, View, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {ThemedText, ThemedView} from '../../components/common';
import {Bell, User} from 'lucide-react-native';
import {useThemeColor, useTicketPagination, useNotification} from '../../hooks';
import {MainStackParamList} from '../../types/navigation';
import {Ticket} from '../../types/ticket';
import {GenreFilter, TicketList} from './_components';
import {SAMPLE_TICKETS} from '../../data/ticket';
import {getListTicket} from '../../services/apis/ticket';
import {Badge} from '../../components/ui/badge';
import {getNotifications} from '../../services/apis/notification';
import {useAgentStatus} from '../../contexts/agent-provider';
import {CredentialExchangeRecord} from '@credo-ts/core';

type HomeScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Home'>;
};

// VC 타입 정의
interface VirtualCredential {
  id: string;
  state: string;
  threadId?: string;
  credential?: {
    credentialSubject?: any;
  };
}

// API 호출 함수 (실제 구현은 사용자가 할 예정)
const fetchTickets = async (cursor?: string, genre?: string) => {
  try {
    const response = await getListTicket(genre, cursor);
    // API 응답 구조 확인 및 안전한 처리
    if (!response) {
      throw new Error('API 응답이 없습니다.');
    }
    // 응답 구조에 따라 안전하게 데이터 추출
    const tickets = response.content || response.tickets || [];
    const next_cursor = response.next_cursor || response.nextCursor || null;
    const hasMore =
      response.hasMore !== undefined ? response.hasMore : next_cursor !== null;
    return {
      tickets: tickets,
      nextCursor: next_cursor,
      hasMore,
    };
  } catch (error) {
    console.error('티켓 목록 조회 실패:', error);
    // 에러 발생 시 빈 결과 반환
    return {
      tickets: SAMPLE_TICKETS,
      nextCursor: null,
      hasMore: false,
    };
  }
};

// 홈화면에서 안 읽은 알림 개수 가져오기
const fetchUnreadNotificationCount = async () => {
  try {
    const response = await getNotifications();
    const unreadCount = (response.notifications || []).filter(
      (n: any) => !n.isChecked,
    ).length;
    return unreadCount;
  } catch (error) {
    console.error('안 읽은 알림 개수 조회 실패:', error);
    return 0;
  }
};

export default function HomeScreen({navigation}: HomeScreenProps) {
  const {unreadCount, setUnreadCount} = useNotification();
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [virtualCredentials, setVirtualCredentials] = useState<
    VirtualCredential[]
  >([]);
  const [isLoadingVC, setIsLoadingVC] = useState<boolean>(false);
  const {
    isInitialized,
    agent,
    userConnectionId,
    mediatorConnectionId,
    didPublicKey,
  } = useAgentStatus();

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
      bookingId: ticket.bookingId.toString(),
    });
  };

  const handleRefresh = () => {
    refreshTickets();
  };

  const handleGenreChange = (genre: string | null) => {
    setActiveGenre(genre);
    changeGenre(genre);
  };

  // Agent가 보유한 VC 조회 함수
  const fetchVirtualCredentials = async () => {
    if (!isInitialized || !agent) {
      console.log('Agent가 초기화되지 않아 VC 조회를 건너뜁니다.');
      return;
    }

    setIsLoadingVC(true);
    try {
      console.log('🔍 Agent가 보유한 VC 조회 시작...');
      const allCredentials: CredentialExchangeRecord[] =
        await agent.credentials.getAll();

      console.log('📋 조회된 VC 개수:', allCredentials.length);
      console.log('📋 VC 목록:', JSON.stringify(allCredentials));

      setVirtualCredentials(allCredentials as unknown as VirtualCredential[]);
    } catch (error) {
    } finally {
      setIsLoadingVC(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialTickets();
  }, [loadInitialTickets]);

  // Agent 준비 상태 확인 (AgentProvider에서 관리)
  useEffect(() => {
    const checkAgentStatus = () => {
      const isReady = isInitialized && userConnectionId && mediatorConnectionId;
      const canRequestVC = isReady && didPublicKey;

      console.log('홈 화면 - Agent 준비 상태 확인:', {
        isInitialized,
        isReady,
        canRequestVC,
        hasAgent: !!agent,
        userConnectionId: userConnectionId || '없음',
        mediatorConnectionId: mediatorConnectionId || '없음',
        didPublicKey: didPublicKey ? '있음' : '없음',
      });

      if (!isInitialized) {
        console.log(
          'Agent가 초기화되지 않음 - AgentProvider에서 자동 초기화 예정',
        );
      } else if (canRequestVC) {
        console.log('Agent가 준비됨 - VC 요청 가능');
        // Agent가 준비되면 VC 조회
        fetchVirtualCredentials();
      } else if (isInitialized) {
        console.log('Agent가 초기화됨 - 연결 설정 필요');
      }
    };

    checkAgentStatus();
  }, [
    isInitialized,
    agent,
    userConnectionId,
    mediatorConnectionId,
    didPublicKey,
  ]);

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
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );
  const textColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
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
          <GenreFilter
            activeGenre={activeGenre}
            onGenreChange={handleGenreChange}
          />
          <TicketList
            tickets={tickets}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onTicketPress={handleTicketPress}
            onRefresh={handleRefresh}
            onLoadMore={loadMoreTickets}
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
