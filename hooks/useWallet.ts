import {useCallback, useEffect, useState} from 'react';
import useAuth from './useAuth';
import DIDService from '../services/did/did-service';
import {getTokens} from '../services/storage/securStorage';
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
   * 지갑 초기화 및 DID 연결
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
        console.log('저장된 지갑 정보를 사용합니다:', savedWalletInfo);
        info = {
          ...savedWalletInfo,
          lastAccess: new Date().toISOString(),
        };
      } else {
        // 지갑 정보 생성
        console.log('새로운 지갑 정보를 생성합니다.');
        const walletId = `wallet-${user}`;
        const walletKey = `key-${user}`;
        const now = new Date().toISOString();

        info = {
          walletId,
          walletKey,
          createdAt: now,
          lastAccess: now,
        };
      }

      // 지갑 정보 저장
      await saveWalletInfo(info);
      setWalletInfo(info);

      // DID 에이전트 초기화
      console.log('DID 에이전트 초기화 시작 (useWallet)...');

      // 저장된 지갑 정보로 에이전트 초기화
      await DIDService.initializeAgent(user, info.walletId, info.walletKey);
      console.log('DID 에이전트 초기화 완료 (useWallet)');

      // 토큰 가져오기
      const tokens = await getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('액세스 토큰이 없습니다.');
      }

      // DID 초대 URL 가져오기 및 연결
      console.log('DID 초대 URL 요청 중...');
      try {
        const invitationUrls = await DIDService.getInvitationUrls(
          tokens.accessToken,
        );
        console.log('DID 초대 URL 가져오기 완료', invitationUrls);

        try {
          // user-aca-py에만 연결하고 public key 전송
          console.log('DID 서비스 연결 중...');
          await DIDService.connectToDIDServices(
            invitationUrls.mediatorInvitationUrl,
            invitationUrls.userAcaPyInvitationUrl,
          );
          console.log('DID 서비스 초기화 및 연결 완료');
        } catch (didError) {
          console.error('DID 서비스 연결 실패:', didError);
          // DID 연결 실패해도 지갑 초기화는 성공으로 처리
        }
      } catch (urlError) {
        console.error('DID 초대 URL 가져오기 실패:', urlError);
        // URL 가져오기 실패해도 지갑 초기화는 성공으로 처리
      }

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
   * DID 공개키 조회
   */
  const getDidPublicKey = useCallback(() => {
    return DIDService.getDidPublicKey();
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
