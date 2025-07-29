import { ThemedText } from "@/components/ThemedText";
import { Platform, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";

interface TestButtonProps {
  title: string;
  onPress: () => void;
}

export default function TestButton({ title, onPress }: TestButtonProps) {
  return (
    <SafeAreaView style={styles.bottomSafeArea}>
      <TouchableOpacity style={styles.testButton} onPress={onPress}>
        <ThemedText style={styles.testButtonText}>{title}</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomSafeArea: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(46, 91, 255, 0.1)",
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 24 : 0,
  },
  testButtonText: {
    color: "#2E5BFF",
    fontWeight: "600",
  },
});
