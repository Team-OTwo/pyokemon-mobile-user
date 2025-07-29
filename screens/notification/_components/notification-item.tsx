import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NotificationItem = ({ notification }: { notification: any }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View>
        <ThemedText style={styles.title} type="defaultSemiBold">
          {notification.title}
        </ThemedText>
        <ThemedText style={styles.body} type="subtitle">
          {notification.body}
        </ThemedText>
        <ThemedText style={styles.date} type="default">
          {notification.date}
        </ThemedText>
      </View>
      <View>
        <Text style={styles.dot}>{notification.isRead ? "" : "●"}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  body: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
  dot: {
    fontSize: 12,
    color: "#FFCF36",
  },
});
