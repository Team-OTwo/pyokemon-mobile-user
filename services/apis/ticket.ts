import restful from './restful';
import type {TicketDetail} from '../../types/ticket';

export const getDetailTicket = async (
  ticketId: string,
): Promise<TicketDetail> => {
  const response = await restful(
    'GET',
    `bff/api/app/bookings/my-tickets/${ticketId}`,
    undefined,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      isAuth: true,
    },
  );
  if (response) {
    return response;
  }
  throw new Error(response.message || '티켓 상세 조회에 실패했습니다');
};

export const getListTicket = async (genre?: string, cursor?: string) => {
  try {
    const params = {
      genre: genre || '전체',
      ...(cursor && {cursor}),
    };
    const response = await restful(
      'GET',
      `bff/api/app/bookings/my-tickets?${new URLSearchParams(
        params,
      ).toString()}`,
      {},
      {
        isAuth: true,
      },
    );

    // 응답이 있으면 반환
    return response || {content: [], next_cursor: null, hasMore: false};
  } catch (error) {
    console.error('티켓 목록 조회 API 에러:', error);
    // 에러 발생 시 기본값 반환
    return {content: [], next_cursor: null, hasMore: false};
  }
};
