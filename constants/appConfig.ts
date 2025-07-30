/**
 * 앱 설정 상수 정의
 * 앱의 전반적인 설정값들을 중앙에서 관리
 */

export const APP_CONFIG = {
  // 앱 기본 정보
  APP_NAME: "Pyokemon",
  APP_VERSION: "1.0.0",
  BUILD_NUMBER: "1",

  // 스플래시 화면 설정
  SPLASH_DURATION: 3000, // 3초

  // 폰트 설정
  FONTS: {
    SPACE_MONO: "SpaceMono",
  },

  // 애니메이션 설정
  ANIMATION: {
    DURATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN_OUT: "ease-in-out",
      EASE_OUT: "ease-out",
      EASE_IN: "ease-in",
    },
  },

  // 스토리지 키
  STORAGE_KEYS: {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_PROFILE: "user_profile",
    APP_SETTINGS: "app_settings",
    NOTIFICATION_SETTINGS: "notification_settings",
  },

  // 네트워크 설정
  NETWORK: {
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    CACHE_DURATION: 5 * 60 * 1000, // 5분
  },

  // QR 코드 설정
  QR_CODE: {
    SIZE: 200,
    ERROR_CORRECTION_LEVEL: "M",
  },

  // 카메라 설정
  CAMERA: {
    QUALITY: 0.8,
    ASPECT_RATIO: [4, 3],
  },
} as const;

export const ENVIRONMENT = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

export const CURRENT_ENV = process.env.EXPO_PUBLIC_ENV || ENVIRONMENT.DEVELOPMENT;
