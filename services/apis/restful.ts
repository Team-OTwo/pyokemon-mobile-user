import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
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
  timeout?: number;
  retries?: number;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'ApiError';
  }
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
    // console.error('getAuthToken error', error);
    return null;
  }
};

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

axios.interceptors.response.use(
  response => response,
  error => {
    handleApiError(error);
    return Promise.reject(error);
  },
);

const handleApiError = (error: AxiosError, retries: number = 0): void => {
  if (error.code === 'ECONNABORTED' && retries > 0) {
    throw new ApiError(408, '요청 시간이 초과되었습니다.', error);
  }

  if (error.response) {
    // 서버 응답이 있는 경우
    const status = error.response.status;
    const message =
      (error.response.data as any).message || '서버 오류가 발생했습니다.';
    // throw new ApiError(status, message, error);
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우
    throw new ApiError(0, '네트워크 연결을 확인해주세요.', error);
  } else {
    // 요청 자체에 문제가 있는 경우
    throw new ApiError(0, '요청을 처리할 수 없습니다.', error);
  }
};

export const apiRequest = async <T = any>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options: RequestOptions = {},
): Promise<T> => {
  const {
    isFormData = false,
    isAuth = false,
    headers = {},
    timeout = 10000,
    retries = 0,
  } = options;

  try {
    const url = `${API_URL}${endpoint}`;

    // 기본 설정
    const config: AxiosRequestConfig = {
      headers: { ...headers },
      timeout,
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
        if (requestData && Object.keys(requestData).length > 0) {
          config.params = requestData;
        }
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
    // 재시도 로직
    if (
      retries > 0 &&
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest<T>(method, endpoint, data, {
        ...options,
        retries: retries - 1,
      });
    }

    handleApiError(error, retries);
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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  uri: string,
  params: any,
  options?: RequestOptions,
) => {
  if (options?.isFormData) {
    return apiService.upload(uri, params);
  }

  // POST, PUT, PATCH 요청 시 params를 data로 전달
  if (method === 'POST') {
    return apiService.post(uri, params, options);
  }
  if (method === 'PUT') {
    return apiService.put(uri, params, options);
  }
  if (method === 'PATCH') {
    return apiService.patch(uri, params, options);
  }

  // GET, DELETE 요청 시 params를 쿼리 파라미터로 전달
  return method === 'GET'
    ? apiService.get(uri, params, options)
    : apiService.delete(uri, params, options);
};

export default restful;
