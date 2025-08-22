export type VerificationStep = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  hasInput: boolean;
  inputType?: 'phone' | 'code';
  buttonText?: string;
};

export type ValidationErrors = {
  phoneNumber?: string;
  verificationCode?: string;
};

export type MessageType = 'FIRST_LOGIN' | 'DIFFERENT_DEVICE';
export type RequestType = 'SMS' | 'CALL' | 'EMAIL';
export type DeviceAction = 'REMOVE_OLD_AND_REGISTER_NEW'; // 단일 옵션으로 변경

export interface VerificationScreenProps {
  message?: string; // 기존 호환성을 위해 유지
  messageType?: MessageType; // 새로운 필드
  requestType?: RequestType;
  deviceAction?: DeviceAction; // 기기 등록 방식
  deviceNumber: string;
  fcmToken: string;
  osType: string;
  accessToken: string;
  refreshToken: string;
}
