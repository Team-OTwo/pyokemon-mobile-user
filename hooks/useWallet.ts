import {useCallback, useEffect, useState} from 'react';
import useAuth from './useAuth';
import {
  getWalletInfo,
  saveWalletInfo,
  removeWalletInfo,
} from '../services/storage/walletStorage';

/**
 * 지갑 정보 타입
 */
export interface WalletInfo {
  walletId: string;
  walletKey: string;
  createdAt: string;
  lastAccess: string;
  migrated?: boolean;
  // 연결 정보 (선택적)
  userConnectionId?: string;
  mediatorConnectionId?: string;
  didPublicKey?: string;
  savedAt?: string;
}

/**
 * 지갑 관리 훅
 */
export const useWallet = () => {
  const {user} = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 지갑 초기화 (단순화된 버전 - Agent 관련 로직 제거)
   */
  const initializeWallet = useCallback(async () => {
    if (!user) {
      setError('사용자 정보가 없습니다.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 저장된 지갑 정보 확인
      const savedWalletInfo = await getWalletInfo();
      let info: WalletInfo;

      if (savedWalletInfo) {
        // 저장된 지갑 정보가 있으면 사용
        info = {
          ...savedWalletInfo,
          lastAccess: new Date().toISOString(),
        };

        // lastAccess 업데이트된 지갑 정보 저장
        await saveWalletInfo(info);
      } else {
        // 지갑 정보 생성
        const walletId = `wallet-${user}-${Date.now()}`;
        const walletKey = `key-${user}-${Date.now()}`;
        const now = new Date().toISOString();

        info = {
          walletId,
          walletKey,
          createdAt: now,
          lastAccess: now,
        };

        // 새로운 지갑 정보 저장
        await saveWalletInfo(info);
      }

      setWalletInfo(info);
      setIsInitialized(true);
      return true;
    } catch (err: any) {
      console.error('지갑 초기화 실패:', err);
      setError(err.message || '지갑 초기화 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * 지갑 삭제
   */
  const deleteWallet = useCallback(async () => {
    if (!user) {
      setError('사용자 정보가 없습니다.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 지갑 삭제 로직 구현
      console.log('지갑 삭제 시작...');

      // 저장된 지갑 정보 삭제
      await removeWalletInfo();

      setWalletInfo(null);
      setIsInitialized(false);

      console.log('지갑 상태 초기화 완료');
      return true;
    } catch (err: any) {
      console.error('지갑 삭제 실패:', err);
      setError(err.message || '지갑 삭제 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * 지갑 마이그레이션
   */
  const migrateWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 마이그레이션 로직 구현 필요
      console.log('지갑 마이그레이션 시작...');
      // 현재는 성공으로 처리
      console.log('지갑 마이그레이션 완료');
      return true;
    } catch (err: any) {
      console.error('지갑 마이그레이션 실패:', err);
      setError(err.message || '지갑 마이그레이션 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * DID 공개키 조회 (AgentProvider에서 관리)
   */
  const getDidPublicKey = useCallback(() => {
    // AgentProvider에서 관리하므로 여기서는 null 반환
    console.log('DID 공개키는 AgentProvider에서 관리됩니다.');
    return null;
  }, []);

  /**
   * 로그인 시 지갑 자동 초기화
   */
  useEffect(() => {
    const autoInitialize = async () => {
      if (user && !isInitialized && !isLoading) {
        try {
          console.log('사용자 로그인 감지, 지갑 자동 초기화 시도...');
          await initializeWallet();
        } catch (err) {
          console.error('지갑 자동 초기화 중 오류 발생:', err);
          setError('지갑 초기화 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    };

    autoInitialize();
  }, [user, isInitialized, isLoading, initializeWallet]);

  return {
    walletInfo,
    isInitialized,
    isLoading,
    error,
    initializeWallet,
    deleteWallet,
    migrateWallet,
    getDidPublicKey,
  };
};
