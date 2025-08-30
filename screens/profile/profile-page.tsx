import {
  ConfirmationModal,
  ThemedText,
  ThemedView,
  ToggleSwitch,
} from '../../components/common';
import PageHeader from '../../components/ui/header';
import useAuth from '../../hooks/useAuth';
import {useThemeColor} from '../../hooks/useThemeColor';
import {deleteUser} from '../../services/apis';
import {MainStackParamList} from '../../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';

type ProfileProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Profile'>;
};

type ModalType = 'logout' | 'deleteAccount' | null;

export default function Profile({navigation}: ProfileProps) {
  const {signOut} = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
  });

  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    // 회원탈퇴 로직 구현
    try {
      await deleteUser();
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const showModal = (type: ModalType) => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const getModalConfig = () => {
    switch (modalType) {
      case 'logout':
        return {
          title: '로그아웃',
          message: '로그아웃 하시겠습니까?',
          onConfirm: handleLogout,
          type: 'default' as const,
        };
      case 'deleteAccount':
        return {
          title: '회원탈퇴',
          message:
            '정말로 회원탈퇴 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
          onConfirm: handleDeleteAccount,
          confirmText: '탈퇴',
          type: 'danger' as const,
        };
      default:
        return {
          title: '',
          message: '',
          onConfirm: () => {},
          type: 'default' as const,
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <ConfirmationModal
        visible={isModalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => {
          setIsModalVisible(false);
          setModalType(null);
        }}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <PageHeader
          title="마이페이지"
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>알림 설정</ThemedText>
            <ToggleSwitch
              title="푸시 알림"
              value={notificationSettings.pushNotifications}
              onValueChange={value =>
                setNotificationSettings(prev => ({
                  ...prev,
                  pushNotifications: value,
                }))
              }
              description="중요한 알림을 받아보세요"
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>계정 관리</ThemedText>
            <ThemedText
              style={styles.menuItem}
              onPress={() => showModal('logout')}>
              로그아웃
            </ThemedText>
            <ThemedText
              style={[styles.menuItem, styles.deleteText]}
              onPress={() => showModal('deleteAccount')}>
              회원탈퇴
            </ThemedText>
          </View>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  menuItem: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  deleteText: {
    color: 'red',
  },
});
