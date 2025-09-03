import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Linking, TouchableOpacity} from 'react-native';
import {Camera, Frame, useCameraDevices} from 'react-native-vision-camera';

interface QRScannerProps {
  onQRScanned: (data: string) => void;
}

export default function QRScanner({onQRScanned}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
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
    setIsCameraActive(true);
    return () => {
      setIsCameraActive(false);
    };
  }, []);

  const handleFrame = (frame: Frame) => {
    console.log('frame', frame);
  };

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
          frameProcessor={handleFrame}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraActive}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>
      <Text style={styles.instructionText}>
        QR 코드를 프레임 안에 맞춰주세요
      </Text>
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
    position: 'relative',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  container: {
    gap: 20,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
