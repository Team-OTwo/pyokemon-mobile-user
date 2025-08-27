import restful from './restful';

export const getDetailTicket = async (ticketId: string) => {
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
  const params = {
    genre: genre || '전체',
    ...(cursor && { cursor }),
  };
  const response = await restful(
    'GET',
    `bff/api/app/bookings/my-tickets?${new URLSearchParams(params).toString()}`,
    {},
    {
      isAuth: true,
    },
  );

  if (response) {
    return response;
  }
  throw new Error(response.message || '티켓 목록 조회에 실패했습니다');
};
