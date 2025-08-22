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
