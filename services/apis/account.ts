import { getUniqueId } from 'react-native-device-info';
import restful from './restful';

// 앱 로그인
export const login = async (
  loginId: string,
  password: string,
  deviceNumber: string,
) => {
  const response = await restful('POST', 'account/api/app/login', {
    loginId,
    password,
    deviceNumber,
  });
  if (response) {
    return response.data;
  }
  throw new Error(response.message || '로그인에 실패했습니다.');
};

export const logout = async () => {
  const deviceNumber = await getUniqueId();
  const response = await restful(
    'POST',
    `account/api/logout?deviceNumber=${deviceNumber}`,
    {},
    {
      isAuth: true,
    },
  );
  if (response.success && response) {
    return response.data;
  }
  throw new Error(response.message || '로그아웃에 실패했습니다.');
};

// 회원가입
export const signup = async (
  loginId: string,
  password: string,
  passwordCheck: string,
  name: string,
  phone: string,
  birth: string,
) => {
  const response = await restful('POST', 'account/api/users', {
    loginId,
    password,
    passwordCheck,
    name,
    phone,
    birth,
  });
  if (response.success && response) {
    return response.data;
  }

  throw new Error(response.message || '회원가입에 실패했습니다.');
};

// 디바이스 등록
export const registerDevice = async (
  deviceNumber: string,
  fcmToken: string,
  osType: string,
  accessToken: string,
) => {
  const response = await restful(
    'POST',
    'account/api/users/devices',
    {
      deviceNumber,
      fcmToken,
      osType,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (response) {
    return response;
  }
  throw new Error(response.message || '기기등록에 실패했습니다');
};

export const verifyUser = async (accessToken: string) => {
  const response = await restful(
    'POST',
    `account/api/users/verify`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (response) {
    return response;
  }
  throw new Error(response.message || '사용자 인증에 실패했습니다');
};

export const deleteUserDevice = async (accessToken: string) => {
  const response = await restful(
    'DELETE',
    `account/api/users/devices`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (response) {
    return response;
  }
  throw new Error(response.message || '기기삭제에 실패했습니다');
};

//회원탈퇴
export const deleteUser = async () => {
  const response = await restful(
    'DELETE',
    `account/api/users/profile`,
    undefined,
    {
      isAuth: true,
    },
  );
  if (response) {
    return response;
  }
  throw new Error(response.message || '회원탈퇴에 실패했습니다');
};
