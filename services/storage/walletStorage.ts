import * as Keychain from 'react-native-keychain';
import {KEYCHAIN_SERVICE} from './secureStorage';
import {WalletInfo} from '../../hooks/useWallet';

/**
 * 지갑 정보를 키체인에 저장합니다.
 * @param walletInfo - 저장할 지갑 정보
 */
export const saveWalletInfo = async (
  walletInfo: WalletInfo,
): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(
      'walletInfo',
      JSON.stringify(walletInfo),
      {
        service: KEYCHAIN_SERVICE.WALLET,
      },
    );
    console.log('지갑 정보가 성공적으로 저장되었습니다.', {
      walletId: walletInfo.walletId,
      didPublicKey: walletInfo.didPublicKey ? '있음' : '없음',
    });
    return true;
  } catch (error) {
    console.error('지갑 정보 저장 중 오류 발생:', error);
    return false;
  }
};

/**
 * 키체인에서 지갑 정보를 불러옵니다.
 * @returns 지갑 정보 또는 null
 */
export const getWalletInfo = async (): Promise<WalletInfo | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE.WALLET,
    });

    if (credentials) {
      const walletInfo: WalletInfo = JSON.parse(credentials.password);
      console.log('지갑 정보를 성공적으로 불러왔습니다.', {
        walletId: walletInfo.walletId,
        didPublicKey: walletInfo.didPublicKey ? '있음' : '없음',
        createdAt: walletInfo.createdAt,
      });
      return walletInfo;
    } else {
      console.log('저장된 지갑 정보가 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('지갑 정보 불러오기 중 오류 발생:', error);
    return null;
  }
};

/**
 * DID 공개키를 업데이트합니다.
 * @param didPublicKey - 업데이트할 DID 공개키
 * @returns 업데이트 성공 여부
 */
export const updateDidPublicKey = async (
  didPublicKey: string,
): Promise<boolean> => {
  try {
    const existingWalletInfo = await getWalletInfo();
    if (!existingWalletInfo) {
      console.error('기존 지갑 정보를 찾을 수 없습니다.');
      return false;
    }

    const updatedWalletInfo: WalletInfo = {
      ...existingWalletInfo,
      didPublicKey,
      lastAccess: new Date().toISOString(),
    };

    const success = await saveWalletInfo(updatedWalletInfo);
    if (success) {
      console.log('DID 공개키가 성공적으로 업데이트되었습니다:', didPublicKey);
    }
    return success;
  } catch (error) {
    console.error('DID 공개키 업데이트 중 오류 발생:', error);
    return false;
  }
};

/**
 * 키체인에서 지갑 정보를 삭제합니다.
 * @returns 삭제 성공 여부
 */
export const removeWalletInfo = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE.WALLET,
    });
    console.log('지갑 정보가 성공적으로 삭제되었습니다.');
    return true;
  } catch (error) {
    console.error('지갑 정보 삭제 중 오류 발생:', error);
    return false;
  }
};
