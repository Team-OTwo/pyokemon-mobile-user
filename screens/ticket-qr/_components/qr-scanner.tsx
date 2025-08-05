import { ThemedText } from "@/components/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface QRScannerProps {
  onQRScanned: (data: string) => void;
  title: string;
  description: string;
  isActive?: boolean;
}

export default function QRScanner({ onQRScanned, title, description, isActive = true }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraActive, setCameraActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await requestPermission();
      setHasPermission(status === "granted");
    };
    requestCameraPermission();
  }, []);

  const handleBarcodeScanned = (event: BarcodeScanningResult) => {
    if (isScanning || !isActive) return;

    console.log("QR scanned:", event.data);
    setIsScanning(true);
    setCameraActive(false);
    onQRScanned(event.data);
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.permissionText}>카메라 접근 권한이 필요합니다.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.scanner}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          active={cameraActive && isActive}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTarget} />
        </View>
      </View>

      <ThemedText style={styles.description}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  scanner: {
    width: 280,
    height: 280,
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 24,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTarget: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 16,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
});
