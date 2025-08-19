import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokens } from '../storage/securStorage';
import { Platform } from 'react-native';

// API URL은 환경 변수에서 가져오거나 기본값 사용
const API_URL = process.env.API_URL || 'https://api.example.com';

// HTTP 메소드 타입 정의
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  status: number;
  message?: string;
}

// API 요청 옵션 타입 정의
export interface RequestOptions {
  headers?: Record<string, string>;
  isFormData?: boolean;
  isAuth?: boolean;
}

/**
 * 인증 토큰을 가져오는 함수
 * @returns 저장된 액세스 토큰
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const tokenData: any = await getTokens();
    return tokenData?.accessToken || null;
  } catch (error) {
    return null;
  }
};

/**
 * FormData 객체 생성 함수
 * @param data FormData로 변환할 데이터
 * @returns FormData 객체
 */
const createFormData = (data: any): FormData => {
  const formData = new FormData();

  if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
    const file = data.assets[0];
    formData.append('file', {
      name: file.fileName,
      type: file.type,
      uri:
        Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    });
  }

  // 파일 외 다른 데이터도 FormData에 추가
  Object.keys(data).forEach(key => {
    if (key !== 'assets') {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

/**
 * API 요청 함수
 * @param method HTTP 메소드
 * @param endpoint API 엔드포인트
 * @param data 요청 데이터
 * @param options 요청 옵션
 * @returns API 응답
 */
export const apiRequest = async <T = any>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options: RequestOptions = {},
): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint}`;
    const { isFormData = false, isAuth = false, headers = {} } = options;

    // 기본 설정
    const config: AxiosRequestConfig = {
      headers: { ...headers },
    };

    // 인증 토큰 추가
    if (isAuth) {
      const token: any = await getAuthToken();
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    // 요청 데이터 준비
    let requestData = data;
    if (isFormData && data) {
      requestData = createFormData(data);
      if (config.headers) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }

    // API 요청 실행
    let response: AxiosResponse;

    switch (method) {
      case 'GET':
        config.params = requestData;
        response = await axios.get(url, config);
        break;
      case 'POST':
        response = await axios.post(url, requestData, config);
        break;
      case 'PUT':
        response = await axios.put(url, requestData, config);
        break;
      case 'DELETE':
        config.params = requestData;
        response = await axios.delete(url, config);
        break;
      case 'PATCH':
        response = await axios.patch(url, requestData, config);
        break;
      default:
        throw new Error(`지원하지 않는 HTTP 메소드입니다: ${method}`);
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message || 'API 요청에 실패했습니다.');
  }
};

/**
 * 간편 API 호출 함수들
 */
const apiService = {
  get: <T = any>(endpoint: string, params?: any, options?: RequestOptions) =>
    apiRequest<T>('GET', endpoint, params, options),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>('POST', endpoint, data, options),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>('PUT', endpoint, data, options),

  delete: <T = any>(endpoint: string, params?: any, options?: RequestOptions) =>
    apiRequest<T>('DELETE', endpoint, params, options),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>('PATCH', endpoint, data, options),

  upload: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>('POST', endpoint, data, { isFormData: true }),
};

// 기존 코드와의 호환성을 위한 함수
const restful = async (
  method: 'GET' | 'POST',
  uri: string,
  params: any,
  options?: RequestOptions,
) => {
  if (options?.isFormData) {
    return apiService.upload(uri, params);
  }

  return method === 'GET'
    ? apiService.get(uri, params, options)
    : apiService.post(uri, params, options);
};

export default restful;
