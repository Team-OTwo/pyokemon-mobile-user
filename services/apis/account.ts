import restful from './restful';

// 앱 로그인
export const login = async (
  loginId: string,
  password: string,
  device_number: string,
) => {
  const response = await restful('POST', 'account/api/app/login', {
    loginId,
    password,
    device_number,
  });
  if (response.success && response) {
    return response.data;
  }
  throw new Error(response.message || '로그인에 실패했습니다.');
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

  if (response.success && response.data) {
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
  console.log('response', response);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || '기기등록에 실패했습니다');
};
