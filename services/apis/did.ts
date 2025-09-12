import restful from './restful';

export const getInvitationUrls = async (accessToken: string) => {
  try {
    console.log('DID 초대 URL API 요청 시작');
    const response = await restful(
      'POST',
      'did/api/invitations',
      {},
      {
        headers: {Authorization: `Bearer ${accessToken}`},
      },
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error('DID 초대 URL 요청 오류:', error);
    throw error;
  }
};

export const getCredential = async (booking_id: string) => {
  try {
    console.log('VC 요청 시작');
    const response = await restful(
      'POST',
      'did/api/verifications/delegate-credential',
      {
        booking_id,
      },
      {
        isAuth: true,
      },
    );
    return response;
  } catch (error) {
    console.error('VC가 존재하지 않습니다. 오류:', error);
    throw error;
  }
};
