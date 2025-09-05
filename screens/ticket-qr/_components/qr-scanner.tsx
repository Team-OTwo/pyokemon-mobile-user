import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface QRScannerProps {
  onQRScanned: (data: string) => void;
}

export default function QRScanner({onQRScanned}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(true);
  const scannerRef = useRef<QRCodeScanner>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      if (!permission) {
        setHasPermission(false);
        return;
      }

      const result = await check(permission);

      switch (result) {
        case RESULTS.UNAVAILABLE:
          Alert.alert('오류', '카메라를 사용할 수 없습니다.');
          setHasPermission(false);
          break;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          setHasPermission(requestResult === RESULTS.GRANTED);
          break;
        case RESULTS.LIMITED:
        case RESULTS.GRANTED:
          setHasPermission(true);
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            '권한 필요',
            '카메라 권한이 차단되었습니다. 설정에서 권한을 허용해주세요.',
            [
              {text: '취소', style: 'cancel'},
              {text: '설정', onPress: () => Linking.openSettings()},
            ],
          );
          setHasPermission(false);
          break;
        default:
          setHasPermission(false);
          break;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
    }
  };

  const onSuccess = (e: any) => {
    if (!isActive) return;

    console.log('QR 스캔됨:', e.data);

    // URL인지 확인
    if (e.data.startsWith('http://') || e.data.startsWith('https://')) {
      onQRScanned(e.data);
    } else {
      // URL이 아닌 경우 바로 처리
      setIsActive(false);
      onQRScanned(e.data);

      // 2초 후 다시 스캔 가능하게
      setTimeout(() => {
        setIsActive(true);
        scannerRef.current?.reactivate();
      }, 2000);
    }
  };

  const reactivateScanner = () => {
    setIsActive(true);
    scannerRef.current?.reactivate();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.permissionText}>카메라 권한 확인 중...</Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}>
            <Text style={styles.buttonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>입장 티켓을 스캔해주세요</Text>
        <Text style={styles.text}>QR을 스캔하면 입장이 완료됩니다.</Text>
      </View>

      <View style={styles.scanArea}>
        <QRCodeScanner
          ref={scannerRef}
          onRead={onSuccess}
          reactivate={isActive}
          reactivateTimeout={2000}
          showMarker={false}
          cameraStyle={styles.camera}
          containerStyle={styles.scannerContainer}
          topViewStyle={styles.topView}
          bottomViewStyle={styles.bottomView}
          customMarker={
            <View style={styles.customMarker}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          }
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.instructionText}>
          📱 QR 코드를 프레임 안에 맞춰주세요
        </Text>
        {!isActive && (
          <TouchableOpacity
            style={styles.reactivateButton}
            onPress={reactivateScanner}>
            <Text style={styles.reactivateButtonText}>다시 스캔하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const CAMERA_SIZE = Math.min(screenWidth * 0.8, 300);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    backgroundColor: 'transparent',
    flex: 0,
    height: CAMERA_SIZE,
    width: CAMERA_SIZE,
  },
  camera: {
    height: CAMERA_SIZE,
    width: CAMERA_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  topView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  bottomView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  customMarker: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 35,
    height: 35,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00ff88',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 35,
    height: 35,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00ff88',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 35,
    height: 35,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00ff88',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 35,
    height: 35,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00ff88',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#00ff88',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactivateButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  reactivateButtonText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
  },
});
