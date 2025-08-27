import * as Keychain from 'react-native-keychain';
/**
 * SecureStore 래퍼 서비스
 * 앱의 로컬 데이터 저장을 관리
 * 데이터 저장 시 자동으로 타임스탬프 추가
 * 데이터 조회 시 타임스탬프 확인 후 만료 시 삭제
 * 데이터 삭제 시 자동으로 타임스탬프 삭제
 * 데이터 삭제 시 자동으로 타임스탬프 삭제
 */

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
    // 'authToken'은 이 데이터를 식별하기 위한 고유한 키(username 역할)입니다.
    await Keychain.setGenericPassword('authToken', JSON.stringify(tokens));
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
    // 'authToken' 키로 저장된 데이터를 불러옵니다.
    const credentials = await Keychain.getGenericPassword();

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
    // 1. 현재 저장된 토큰을 모두 가져옵니다.
    // const currentTokens = await getTokens();

    // if (!currentTokens?.accessToken) {
    //   console.log('삭제할 토큰이 없습니다.');
    //   return;
    // }
    // 2. 불러온 객체에서 accessToken 속성을 삭제합니다.
    // const { accessToken, ...rest } = currentTokens;
    await Keychain.resetGenericPassword();
  } catch (error) {
    console.error('리프레시 토큰 삭제 중 오류 발생:', error);
  }
};

export { setTokens, getTokens, removeTokens };
