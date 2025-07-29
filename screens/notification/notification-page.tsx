import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SAMPLE_NOTIFICATIONS } from "@/data/notification";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootStackParamList } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { FlatList, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import NotificationItem from "./_components/notification-item";

type NotificationProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Notification">;
};

export default function Notification({ navigation }: NotificationProps) {
  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");
  const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");
  const borderColor = useThemeColor({ light: "#E5E9F0", dark: "#2C3235" }, "text");

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>알림</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <FlatList
            data={SAMPLE_NOTIFICATIONS}
            renderItem={({ item }) => <NotificationItem notification={item} />}
            keyExtractor={(item) => item.id}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === "ios" ? 10 : 30,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
  },
});
