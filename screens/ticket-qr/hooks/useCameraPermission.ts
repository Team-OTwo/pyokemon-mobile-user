import { PermissionsAndroid, Platform } from 'react-native';
import { useEffect, useState } from 'react';

export function useCameraPermission() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: '카메라 권한',
              message: 'QR 코드를 스캔하기 위해 카메라 권한이 필요합니다.',
              buttonNeutral: '나중에',
              buttonNegative: '거부',
              buttonPositive: '허용',
            },
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (err) {
          console.warn(err);
          setHasPermission(false);
        }
      } else {
        // iOS는 Info.plist에서 권한 설정
        setHasPermission(true);
      }
    };
    requestCameraPermission();
  }, []);

  return { hasPermission };
}
