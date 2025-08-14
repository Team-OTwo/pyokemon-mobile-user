// src/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Verification: {
    deviceId: string;
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
