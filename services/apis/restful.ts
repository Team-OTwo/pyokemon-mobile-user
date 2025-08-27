import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokens, setAccessToken } from '../storage/securStorage';
import { API_URL } from '@env';
import { Alert } from 'react-native';
import { useAuth } from '@/hooks';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  status: number;
  message?: string;
}

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

const API_BASE_URL = API_URL || 'https://api.example.com';
const DEFAULT_TIMEOUT = 30000;
const RETRY_DELAY = 1000;

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

// const processQueue = (
//   error: Error | null,
//   token: string | null = null,
// ): void => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error);
//     } else if (token) {
//       resolve(token);
//     }
//   });
//   failedQueue = [];
// };

const getAuthToken = async (): Promise<string | null> => {
  try {
    const tokenData = await getTokens();
    return tokenData?.accessToken || null;
  } catch {
    return null;
  }
};

const refreshAuthToken = async (refreshToken: string): Promise<string> => {
  const response = await restful(
    'POST',
    'account/api/refresh',
    {},
    {
      headers: { Authorization: `Bearer ${refreshToken}` },
    },
  );

  if (!response.success || !response.data?.accessToken) {
    Alert.alert('재로그인 해주시기 바랍니다');
    await useAuth().signOut();
  }
  setAccessToken(response.data.accessToken);

  return response.data.accessToken;
};

const createFormData = (data: any): FormData => {
  const formData = new FormData();

  // 파일 데이터 처리
  if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
    const file = data.assets[0];
    formData.append('file', {
      name: file.fileName,
      type: file.type,
      uri: file.uri,
    });
  }

  // 일반 데이터 처리
  Object.keys(data).forEach(key => {
    if (key !== 'assets') {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

const handleApiError = (error: AxiosError, retries: number = 0): void => {
  if (error.code === 'ECONNABORTED' && retries > 0) {
    throw new ApiError(408, '요청 시간이 초과되었습니다.', error);
  }

  if (error.response) {
    const status = error.response.status;
    const message =
      (error.response.data as any)?.message || '서버 오류가 발생했습니다.';
    throw new ApiError(status, message, error);
  }

  if (error.request) {
    throw new ApiError(0, '네트워크 연결을 확인해주세요.', error);
  }

  throw new ApiError(0, '요청을 처리할 수 없습니다.', error);
};

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중인 경우 대기열에 추가
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenData = await getTokens();

        if (!tokenData?.refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.');
        }

        const newAccessToken = await refreshAuthToken(tokenData.refreshToken);

        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // processQueue(null, newAccessToken);

        return axios(originalRequest);
      } catch (refreshError) {
        const error =
          refreshError instanceof Error
            ? refreshError
            : new Error('토큰 재발급 실패');
        // processQueue(error, null);
        throw error;
      } finally {
        // isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

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
    timeout = DEFAULT_TIMEOUT,
    retries = 0,
  } = options;

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: AxiosRequestConfig = {
      headers: { ...headers },
      timeout,
    };

    // 인증 토큰 추가
    if (isAuth) {
      const token = await getAuthToken();
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
    const response = await executeRequest(method, url, requestData, config);
    return response.data;
  } catch (error: any) {
    // 재시도 로직
    if (retries > 0 && shouldRetry(error)) {
      await delay(RETRY_DELAY);
      return apiRequest<T>(method, endpoint, data, {
        ...options,
        retries: retries - 1,
      });
    }

    handleApiError(error, retries);
    throw new Error(
      error.response?.data?.message || 'API 요청에 실패했습니다.',
    );
  }
};

const executeRequest = async (
  method: HttpMethod,
  url: string,
  data: any,
  config: AxiosRequestConfig,
): Promise<AxiosResponse> => {
  switch (method) {
    case 'GET':
      config.params = data;
      return axios.get(url, config);
    case 'POST':
      return axios.post(url, data, config);
    case 'PUT':
      return axios.put(url, data, config);
    case 'DELETE':
      if (data && Object.keys(data).length > 0) {
        config.params = data;
      }
      return axios.delete(url, config);
    case 'PATCH':
      return axios.patch(url, data, config);
    default:
      throw new Error(`지원하지 않는 HTTP 메소드입니다: ${method}`);
  }
};

const shouldRetry = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================================================
// API SERVICE METHODS
// ============================================================================

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

// ============================================================================
// LEGACY COMPATIBILITY FUNCTION
// ============================================================================

const restful = async (
  method: HttpMethod,
  uri: string,
  params: any,
  options?: RequestOptions,
) => {
  if (options?.isFormData) {
    return apiService.upload(uri, params);
  }

  const isDataMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  if (isDataMethod) {
    return apiService[method.toLowerCase() as keyof typeof apiService](
      uri,
      params,
      options,
    );
  }

  return method === 'GET'
    ? apiService.get(uri, params, options)
    : apiService.delete(uri, params, options);
};

export default restful;
