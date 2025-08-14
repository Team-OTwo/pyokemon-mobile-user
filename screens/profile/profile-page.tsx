import { ThemedText, ThemedView } from '@/components/common';
import useAuth from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import { removeStorageItem } from '@/services';
import { removeTokens } from '@/services/storage/securStorage';
import { MainStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type ProfileProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Profile'>;
};

export default function Profile({ navigation }: ProfileProps) {
  const { signOut } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>마이페이지</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.title}>알림설정</ThemedText>
          <ThemedText style={styles.title} onPress={handleLogout}>
            로그아웃
          </ThemedText>
          <ThemedText style={[styles.title, { color: 'red' }]}>
            회원탈퇴
          </ThemedText>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === 'ios' ? 10 : 30,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingLeft: 30,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
