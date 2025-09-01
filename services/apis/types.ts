/**
 * API 서비스 타입 정의
 */

// 기본 API 응답 타입
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  status: number;
}

// 데이터가 포함된 API 응답 타입
export interface DataApiResponse<T = any> extends BaseApiResponse {
  data?: T;
}

// 페이지네이션 메타데이터 타입
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 페이지네이션 응답 타입
export interface PaginatedApiResponse<T = any> extends BaseApiResponse {
  data?: T[];
  meta?: PaginationMeta;
}

// 인증 관련 타입
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// 파일 업로드 응답 타입
export interface FileUploadResponse {
  fileId: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface InvitationResponse {
  success: boolean;
  message: string | null;
  data: {
    mediator_acapy_invi_url: string;
    user_acapy_invi_url: string;
  };
  errorCode: string | null;
}
