// src/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  MessageType,
  RequestType,
  DeviceAction,
} from '@/screens/verification/types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Verification: {
    message?: string; // 기존 호환성을 위해 유지
    messageType?: MessageType;
    requestType?: RequestType;
    deviceAction?: DeviceAction;
    deviceNumber: string;
    fcmToken: string;
    osType: string;
    accessToken: string;
    refreshToken: string;
  };
};

export type MainStackParamList = {
  Home: undefined;
  Splash: undefined;
  Profile: undefined;
  Notification: undefined;
  TicketDetail: { ticketId: string };
  TicketQR: { ticketId: string };
};

export type ProfileScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'Profile'
>;
