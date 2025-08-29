/**
 * 네비게이션 상수 정의
 * 네비게이션 관련 설정값들을 중앙에서 관리
 */

export const NAVIGATION = {
  // 스크린 이름
  SCREENS: {
    SPLASH: "Splash",
    LOGIN: "Login",
    SIGNUP: "Signup",
    HOME: "Home",
    PROFILE: "Profile",
    NOTIFICATION: "Notification",
    TICKET_DETAIL: "TicketDetail",
    TICKET_QR: "TicketQR",
  },

  // 헤더 설정
  HEADER: {
    HEIGHT: 56,
    TITLE_FONT_SIZE: 18,
    TITLE_FONT_WEIGHT: "600",
  },

  // 애니메이션 설정
  ANIMATION: {
    DURATION: 300,
    EASING: "ease-in-out",
  },
} as const;

export const ROUTE_PARAMS = {
  TICKET_ID: "ticketId",
  USER_ID: "userId",
  NOTIFICATION_ID: "notificationId",
} as const;
