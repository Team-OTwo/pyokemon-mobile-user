import { ThemedText, ThemedView } from '@/components/common';
import { SAMPLE_NOTIFICATIONS } from '@/data/notification';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MainStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import NotificationItem from './_components/notification-item';
import PageHeader from '@/components/ui/header';

type NotificationProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Notification'>;
};

export default function Notification({ navigation }: NotificationProps) {
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );
  const tintColor = useThemeColor(
    { light: '#2E5BFF', dark: '#2E5BFF' },
    'tint',
  );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );
  const borderColor = useThemeColor(
    { light: '#E5E9F0', dark: '#2C3235' },
    'text',
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <PageHeader title="알림" onBackPress={() => navigation.goBack()} />
        <View style={styles.content}>
          <FlatList
            onRefresh={() => {
              console.log('refresh');
            }}
            refreshing={false}
            data={SAMPLE_NOTIFICATIONS}
            renderItem={({ item }) => <NotificationItem notification={item} />}
            keyExtractor={item => item.notification_id}
            style={styles.list}
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
});
