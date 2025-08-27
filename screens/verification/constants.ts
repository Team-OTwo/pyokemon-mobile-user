import {
  VerificationStep,
  MessageType,
  RequestType,
  DeviceAction,
} from './types';

export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: 0,
    title: '본인 인증을 시작합니다',
    subtitle:
      '최초 로그인이시군요! 회원님의 기기등록을 위해 본인 인증을 진행해주세요',
    icon: 'verified-user',
    hasInput: false,
    buttonText: '본인인증 시작하기',
  },
  {
    id: 1,
    title: '휴대폰 인증',
    subtitle: '휴대폰 번호를 입력하여 본인 확인을 진행합니다',
    icon: 'phone-android',
    hasInput: true,
    inputType: 'phone',
    buttonText: '인증번호 발송',
  },
  {
    id: 2,
    title: '인증번호 확인',
    subtitle: '발송된 인증번호를\n입력해주세요',
    icon: 'sms',
    hasInput: true,
    inputType: 'code',
    buttonText: '인증 확인',
  },
  {
    id: 3,
    title: '인증 완료',
    subtitle: '본인 인증이 완료되었습니다\n메인 페이지로 이동합니다',
    icon: 'check-circle',
    hasInput: false,
    buttonText: '홈으로 이동하기',
  },
];

export const PHONE_REGEX = /^01[0-9]\d{3,4}\d{4}$/;
export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_TIMEOUT_SECONDS = 180; // 3분

// 메시지 타입별 동적 메시지
export const getMessageByType = (messageType: MessageType): string => {
  switch (messageType) {
    case 'FIRST_LOGIN':
      return '최초 로그인이시군요! 회원님의 기기등록을 위해 본인 인증을 진행해주세요';
    case 'DIFFERENT_DEVICE':
      return '등록된 디바이스가 다릅니다 기존 기기 등록을 해제하고새로운 기기로 등록해주세요';
    default:
      return '본인 인증을 진행해주세요';
  }
};

// 기기 등록 방식별 메시지
export const getDeviceActionMessage = (deviceAction?: DeviceAction): string => {
  switch (deviceAction) {
    case 'REMOVE_OLD_AND_REGISTER_NEW':
      return '기존 기기 등록을 해제하고\n새로운 기기로 등록하시겠습니까?';
    default:
      return '기기 등록 방식을 선택해주세요';
  }
};

// 요청 타입별 설정
export const getRequestConfig = (requestType: RequestType = 'SMS') => {
  switch (requestType) {
    case 'SMS':
      return {
        icon: 'sms',
        buttonText: '인증번호 발송',
        subtitle: '발송된 인증번호를\n입력해주세요',
      };
    case 'CALL':
      return {
        icon: 'phone',
        buttonText: '음성 인증 시작',
        subtitle: '전화로 발송된 인증번호를\n입력해주세요',
      };
    case 'EMAIL':
      return {
        icon: 'email',
        buttonText: '이메일 인증번호 발송',
        subtitle: '이메일로 발송된 인증번호를\n입력해주세요',
      };
    default:
      return {
        icon: 'sms',
        buttonText: '인증번호 발송',
        subtitle: '발송된 인증번호를\n입력해주세요',
      };
  }
};
