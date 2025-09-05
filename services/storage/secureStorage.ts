import * as Keychain from 'react-native-keychain';
/**
 * SecureStore 래퍼 서비스
 * 앱의 로컬 데이터 저장을 관리
 * 데이터 저장 시 자동으로 타임스탬프 추가
 * 데이터 조회 시 타임스탬프 확인 후 만료 시 삭제
 * 데이터 삭제 시 자동으로 타임스탬프 삭제
 */

// 키체인 서비스 식별자 상수
export const KEYCHAIN_SERVICE = {
  AUTH: 'pyokemon.auth',
  WALLET: 'pyokemon.wallet',
};

/**
 * 액세스 토큰과 리프레시 토큰을 키체인에 저장합니다.
 * @param {string} accessToken - 저장할 액세스 토큰
 * @param {string} refreshToken - 저장할 리프레시 토큰
 */
const setTokens = async (accessToken: string, refreshToken: string) => {
  try {
    // 저장할 토큰들을 하나의 객체로 만듭니다.
    const tokens = {
      accessToken,
      refreshToken,
    };

    // 객체를 JSON 문자열로 변환하여 저장합니다.
    // 서비스 이름을 명시적으로 지정하여 다른 키체인 저장소와 충돌을 방지합니다.
    await Keychain.setGenericPassword('authToken', JSON.stringify(tokens), {
      service: KEYCHAIN_SERVICE.AUTH,
    });
  } catch (error) {
    console.error('토큰 저장 중 오류 발생:', error);
  }
};

/**
 * 키체인에서 토큰 객체(accessToken, refreshToken)를 불러옵니다.
 * @returns {Promise<{accessToken: string, refreshToken: string} | null>} 토큰 객체 또는 null
 */
const getTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> => {
  try {
    // 서비스 이름을 명시적으로 지정하여 인증 토큰만 가져옵니다.
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE.AUTH,
    });

    if (credentials) {
      // 저장된 password(JSON 문자열)를 다시 객체로 파싱합니다.
      const tokens = JSON.parse(credentials.password);
      return tokens;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const setAccessToken = async (accessToken: string) => {
  try {
    const tokens = await getTokens();
    if (tokens) {
      tokens.accessToken = accessToken;
      await setTokens(tokens.accessToken, tokens.refreshToken);
    }
  } catch (error) {
    console.error('액세스 토큰 저장 중 오류 발생:', error);
  }
};

const removeTokens = async () => {
  try {
    // 서비스 이름을 명시적으로 지정하여 인증 토큰만 삭제합니다.
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE.AUTH,
    });
    console.log('인증 토큰이 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('인증 토큰 삭제 중 오류 발생:', error);
  }
};

export {setTokens, getTokens, removeTokens};
