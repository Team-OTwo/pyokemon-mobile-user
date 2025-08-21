import { ConfirmationModal, ThemedText, ThemedView } from '@/components/common';
import PageHeader from '@/components/ui/header';
import useAuth from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MainStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

type ProfileProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Profile'>;
};

export default function Profile({ navigation }: ProfileProps) {
  const { signOut } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleDeleteAccount = async () => {};

  const onClickModal = () => {
    setIsModalVisible(true);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ConfirmationModal
        visible={isModalVisible}
        title="회원탈퇴"
        message="회원탈퇴 하시겠습니까?"
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      />
      <StatusBar barStyle="default" />
      <SafeAreaView style={styles.safeArea}>
        <PageHeader
          title="마이페이지"
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <ThemedText style={styles.title}>알림 설정</ThemedText>
          <ThemedText style={styles.title} onPress={handleLogout}>
            로그아웃
          </ThemedText>
          <ThemedText
            style={[styles.title, { color: 'red' }]}
            onPress={onClickModal}
          >
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
