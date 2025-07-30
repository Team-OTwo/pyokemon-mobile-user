import { SvgLogo, ThemedText, ThemedView } from "@/components/common";
import { SAMPLE_TICKETS } from "@/data/ticket";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootStackParamList } from "@/types/navigation";
import { Ticket } from "@/types/ticket";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { TicketList } from "./_components/TicketList";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [user, setUser] = useState<{ name: string }>({ name: "사용자" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleTicketPress = (ticket: Ticket) => {
    navigation.navigate("TicketDetail", { ticketId: ticket.id });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <SvgLogo width={70} height={70} />
            <View style={styles.userIcon}>
              <Feather
                name="bell"
                size={20}
                color="black"
                onPress={() => {
                  navigation.navigate("Notification");
                }}
              />
              <Feather
                name="user"
                size={20}
                color="black"
                onPress={() => {
                  navigation.navigate("Profile");
                }}
              />
            </View>
          </View>
          <View style={styles.userContainer}>
            <ThemedText style={styles.welcomeText}>티켓 관리</ThemedText>
            <ThemedText style={styles.welcomeText}>안녕하세요, {user.name}님!</ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
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
    backgroundColor: "transparent",
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "android" ? 50 : 16,
  },
  titleContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  userContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userIcon: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    gap: 10,
    right: 0,
    top: 23,
  },
});
