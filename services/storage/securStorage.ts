import * as SecureStore from "expo-secure-store";
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
  timestamp?: number;
}

export const getStorageItem = async <T = any>(key: string): Promise<StorageItem<T> | null> => {
  const item = await SecureStore.getItemAsync(key);
  return item ? JSON.parse(item) : null;
};

export const setStorageItem = async <T = any>(key: string, value: T): Promise<void> => {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
};

export const removeStorageItem = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};
