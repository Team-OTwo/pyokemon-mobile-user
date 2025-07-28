// 네비게이션 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  TicketDetail: { ticketId: string };
  TicketQR: { ticketId: string };
};
