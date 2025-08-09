import { SvgLogo, ThemedText, ThemedView } from '@/components/common';
import { SAMPLE_TICKETS } from '@/data/ticket';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootStackParamList } from '@/types/navigation';
import { Ticket } from '@/types/ticket';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { TicketList } from './_components/ticket-list';
import { Bell, User } from 'lucide-react-native';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [user, setUser] = useState<{ name: string }>({ name: '사용자' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleTicketPress = (ticket: Ticket) => {
    navigation.navigate('TicketDetail', { ticketId: ticket.id });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.welcomeText}>내 티켓</ThemedText>
          <View style={styles.userIcon}>
            <Bell
              size={23}
              color={textColor}
              onPress={() => {
                navigation.navigate('Notification');
              }}
            />
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
            tickets={SAMPLE_TICKETS || []}
            isLoading={isLoading}
            onTicketPress={handleTicketPress}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </View>
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.footer}></View>
        </SafeAreaView>
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
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 50 : 16,
  },
  userIcon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
});
