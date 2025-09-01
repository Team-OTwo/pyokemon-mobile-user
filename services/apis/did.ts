import restful from './restful';
import {InvitationResponse} from './types';

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
