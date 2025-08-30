import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
  ActivityIndicator, // 로딩 상태 표시를 위해 추가
} from 'react-native';
// v2에서는 필요한 훅과 Camera 객체를 import합니다.
import {Camera, useCameraDevices} from 'react-native-vision-camera';

interface QRScannerProps {
  onQRScanned: (data: string) => void;
}

export default function QRScanner({onQRScanned}: QRScannerProps) {
  // 1. Permission을 useState로 직접 관리합니다.
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 2. useCameraDevice 대신 useCameraDevices 훅을 사용합니다.
  const devices = useCameraDevices();
  const device = devices.back;

  // 3. onCodeScanned 콜백 함수를 직접 정의합니다. (useCodeScanner 훅 대체)
  const onCodeScannedCallback = useCallback(
    (codes: any) => {
      if (codes.length > 0 && codes[0]?.value) {
        // 스캔 성공 시 카메라 비활성화하여 중복 스캔 방지
        setIsCameraActive(false);
        onQRScanned(codes[0].value);
      }
    },
    [onQRScanned],
  );

  useEffect(() => {
    // 4. useCameraPermission 훅 대신 static 함수로 권한을 요청합니다.
    (async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status === 'not-determined') {
        const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'authorized');
      } else {
        setHasPermission(status === 'authorized');
      }
    })();
  }, []);

  // 컴포넌트가 화면에 보일 때 카메라를 활성화합니다.
  useEffect(() => {
    // TODO: React Navigation 사용 시 focus/blur 이벤트 리스너를 사용하는 것이 더 좋습니다.
    setIsCameraActive(true);
    return () => {
      setIsCameraActive(false);
    };
  }, []);

  // 기기를 찾는 중이거나 권한 확인 중일 때 로딩 화면을 보여줍니다.
  if (device == null || !hasPermission) {
    // 권한 거부 상태를 별도로 처리
    if (!hasPermission) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}>
            <Text style={styles.buttonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // 기기 로딩 중
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>카메라를 준비 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>입장 티켓을 스캔해주세요</Text>
      <Text style={styles.text}>QR을 스캔하면 입장이 완료됩니다.</Text>
      <View style={styles.scanContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraActive}
          // 5. codeScanner prop 대신 onCodeScanned prop을 사용합니다.
          // onCodeScanned={onCodeScannedCallback}
          // v2에서는 codeScannerOptions prop으로 스캔 타입을 지정합니다.
          // codeScannerOptions={{
          //   codeTypes: ['qr'],
          // }}
        />
      </View>
    </View>
  );
}

// (styles 코드는 이전과 동일)
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
    flex: 1, // 전체 화면을 사용하도록 추가
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
