import * as Keychain from "react-native-keychain";
/**
 * SecureStore 래퍼 서비스
 * 앱의 로컬 데이터 저장을 관리
 * 데이터 저장 시 자동으로 타임스탬프 추가
 * 데이터 조회 시 타임스탬프 확인 후 만료 시 삭제
 * 데이터 삭제 시 자동으로 타임스탬프 삭제
 * 데이터 삭제 시 자동으로 타임스탬프 삭제
 */

export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
}

export const getStorageItem = async <T = any>(key: string): Promise<StorageItem<T> | null> => {
  try {
    const result = await Keychain.getInternetCredentials(key);
    if (result && result.password) {
      const data = JSON.parse(result.password);
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error getting storage item:", error);
    return null;
  }
};

export const setStorageItem = async <T = any>(key: string, value: T): Promise<void> => {
  try {
    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
    };
    await Keychain.setInternetCredentials(key, key, JSON.stringify(item));
  } catch (error) {
    console.error("Error setting storage item:", error);
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await Keychain.resetInternetCredentials(key);
  } catch (error) {
    console.error("Error removing storage item:", error);
  }
};
