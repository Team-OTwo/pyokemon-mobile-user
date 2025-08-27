import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

interface QRScannerProps {
  onQRScanned: (data: string) => void;
}

export default function QRScanner({ onQRScanned }: QRScannerProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0]?.value) {
        onQRScanned(codes[0].value);
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 컴포넌트가 마운트되면 카메라 활성화
  useEffect(() => {
    setIsActive(true);
    return () => {
      setIsActive(false);
    };
  }, []);

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>카메라를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>설정으로 이동</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>입장 티켓을 스캔해주세요</Text>
      <Text style={styles.text}>QR을 스캔하면 입장이 완료됩니다.</Text>
      {/* {!scanned ? ( */}
      <View style={styles.scanContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
      </View>
      {/* ) : (
       <View style={styles.resultContainer}>
         <Text style={styles.resultText}>QR 코드 스캔 완료!</Text>
         <CustomButton text="다시 스캔" onPress={onResetScan} />
       </View>
     )} */}
      {/* <View style={styles.buttonContainer}>
       <CustomButton text="이전 단계로" onPress={onGoBack} />
     </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
  },
  scanContainer: {
    width: 300,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  container: {
    gap: 20,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
