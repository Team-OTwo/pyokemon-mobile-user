# API 문서화 가이드

## 개요

이 문서는 Pyokemon 프로젝트의 API 구조와 사용법을 설명합니다.

## API 클라이언트 구조

### 기본 설정

```typescript
// services/api/api-client.ts
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
```

### HTTP 메서드

```typescript
// GET 요청
const response = await apiClient.get<UserProfile>("/user/profile");

// POST 요청
const response = await apiClient.post<AuthResponse>("/auth/login", {
  email: "user@example.com",
  password: "password123",
});

// PUT 요청
const response = await apiClient.put<UserProfile>("/user/profile", {
  name: "새로운 이름",
});

// DELETE 요청
const response = await apiClient.delete<void>("/user/account");

// PATCH 요청
const response = await apiClient.patch<UserProfile>("/user/profile", {
  avatar: "new-avatar-url",
});
```

## 인증 API

### 로그인

```typescript
// services/auth/auth-service.ts
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: string;
  };
}

// 사용 예시
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
});

if (response.success) {
  // 로그인 성공
  const { accessToken, refreshToken, user } = response.data;
  // 토큰 저장 및 사용자 정보 설정
} else {
  // 로그인 실패
  console.error("로그인 실패:", response.message);
}
```

### 회원가입

```typescript
interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// 사용 예시
const response = await authService.signup({
  email: "newuser@example.com",
  password: "password123",
  name: "홍길동",
  phone: "010-1234-5678",
});
```

### 토큰 갱신

```typescript
// 사용 예시
const response = await authService.refreshToken(refreshToken);

if (response.success) {
  const { accessToken, refreshToken } = response.data;
  // 새로운 토큰 저장
} else {
  // 토큰 갱신 실패 - 재로그인 필요
  await authService.logout();
}
```

## 티켓 API

### 티켓 목록 조회

```typescript
// services/ticket/ticket-service.ts
interface TicketListResponse {
  tickets: Ticket[];
  totalCount: number;
  page: number;
  limit: number;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "active" | "used" | "expired";
  eventDate: string;
  venue: string;
  qrCode: string;
  createdAt: string;
}

// 사용 예시
const response = await ticketService.getTickets({
  page: 1,
  limit: 10,
  status: "active",
});

if (response.success) {
  const { tickets, totalCount } = response.data;
  setTickets(tickets);
  setTotalCount(totalCount);
}
```

### 티켓 상세 조회

```typescript
// 사용 예시
const response = await ticketService.getTicketDetail(ticketId);

if (response.success) {
  const ticket = response.data;
  setTicket(ticket);
}
```

### QR 코드 스캔

```typescript
// 사용 예시
const response = await ticketService.scanQRCode(qrCodeData);

if (response.success) {
  const { ticket, isValid } = response.data;
  if (isValid) {
    // 유효한 티켓 - 입장 처리
    navigation.navigate("EntryComplete", { ticket });
  } else {
    // 무효한 티켓
    Alert.alert("오류", "유효하지 않은 티켓입니다.");
  }
}
```

## 알림 API

### 알림 목록 조회

```typescript
// services/notification/notification-service.ts
interface NotificationListResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// 사용 예시
const response = await notificationService.getNotifications({
  page: 1,
  limit: 20,
});

if (response.success) {
  const { notifications, unreadCount } = response.data;
  setNotifications(notifications);
  setUnreadCount(unreadCount);
}
```

### 알림 읽음 처리

```typescript
// 사용 예시
const response = await notificationService.markAsRead(notificationId);

if (response.success) {
  // 알림 읽음 처리 성공
  updateNotificationStatus(notificationId, true);
}
```

## 에러 처리

### API 에러 타입

```typescript
interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// 에러 코드 정의
const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;
```

### 에러 처리 예시

```typescript
try {
  const response = await authService.login(credentials);

  if (response.success) {
    // 성공 처리
    handleLoginSuccess(response.data);
  } else {
    // API 에러 처리
    handleApiError(response);
  }
} catch (error) {
  // 네트워크 에러 또는 기타 예외 처리
  handleNetworkError(error);
}

function handleApiError(response: ApiResponse) {
  switch (response.status) {
    case 401:
      // 인증 실패
      Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
      break;
    case 422:
      // 유효성 검사 실패
      Alert.alert("입력 오류", response.message);
      break;
    case 500:
      // 서버 오류
      Alert.alert("서버 오류", "잠시 후 다시 시도해주세요.");
      break;
    default:
      Alert.alert("오류", response.message);
  }
}

function handleNetworkError(error: any) {
  if (error.code === "NETWORK_ERROR") {
    Alert.alert("네트워크 오류", "인터넷 연결을 확인해주세요.");
  } else {
    Alert.alert("오류", "알 수 없는 오류가 발생했습니다.");
  }
}
```

## 인터셉터 설정

### 요청 인터셉터

```typescript
// services/api/api-client.ts
class ApiClient {
  private addAuthHeader(headers: Record<string, string> = {}): Record<string, string> {
    const token = getStoredToken(); // 토큰 가져오기

    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retryAttempt = 0): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // 인증 헤더 추가
    const authHeaders = this.addAuthHeader(defaultHeaders);

    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    // ... 나머지 구현
  }
}
```

### 응답 인터셉터

```typescript
// services/api/api-client.ts
class ApiClient {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      // 401 에러 처리 - 토큰 갱신 시도
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 토큰 갱신 성공 - 원래 요청 재시도
          return this.retryOriginalRequest();
        } else {
          // 토큰 갱신 실패 - 로그아웃 처리
          this.handleLogout();
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data,
      status: response.status,
      message: "Success",
      success: true,
    };
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) return false;

      const response = await authService.refreshToken(refreshToken);

      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        storeTokens(accessToken, newRefreshToken);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private handleLogout(): void {
    clearStoredTokens();
    // 로그인 화면으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
}
```

## 캐싱 전략

### 메모리 캐시

```typescript
// services/cache/memory-cache.ts
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
```

### 캐시 적용 예시

```typescript
// services/ticket/ticket-service.ts
class TicketService {
  async getTickets(params: TicketListParams): Promise<ApiResponse<TicketListResponse>> {
    const cacheKey = `tickets:${JSON.stringify(params)}`;

    // 캐시에서 먼저 확인
    const cached = memoryCache.get<TicketListResponse>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        message: "Success (cached)",
        success: true,
      };
    }

    // API 호출
    const response = await apiClient.get<TicketListResponse>("/tickets", params);

    if (response.success) {
      // 캐시에 저장 (5분)
      memoryCache.set(cacheKey, response.data, 5 * 60 * 1000);
    }

    return response;
  }
}
```

## 테스트

### API 서비스 테스트

```typescript
// __tests__/services/auth-service.test.ts
import { authService } from "@/services/auth/auth-service";

// Mock API 클라이언트
jest.mock("@/services/api/api-client");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login successfully", async () => {
    const mockResponse = {
      data: {
        accessToken: "mock-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
        },
      },
      status: 200,
      message: "Success",
      success: true,
    };

    // Mock API 호출
    apiClient.post.mockResolvedValue(mockResponse);

    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    const response = await authService.login(credentials);

    expect(response.success).toBe(true);
    expect(response.data.user.email).toBe("test@example.com");
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", credentials);
  });

  it("should handle login failure", async () => {
    const mockError = {
      message: "Invalid credentials",
      status: 401,
      success: false,
    };

    apiClient.post.mockResolvedValue(mockError);

    const credentials = {
      email: "test@example.com",
      password: "wrong-password",
    };

    const response = await authService.login(credentials);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Invalid credentials");
  });
});
```

## 환경별 설정

### 개발/스테이징/프로덕션 환경

```typescript
// constants/environment.ts
export const ENVIRONMENT = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

export const API_CONFIG = {
  [ENVIRONMENT.DEVELOPMENT]: {
    baseURL: "http://localhost:3000/api",
    timeout: 10000,
  },
  [ENVIRONMENT.STAGING]: {
    baseURL: "https://staging-api.pyokemon.com",
    timeout: 15000,
  },
  [ENVIRONMENT.PRODUCTION]: {
    baseURL: "https://api.pyokemon.com",
    timeout: 20000,
  },
};

export const CURRENT_ENV = process.env.EXPO_PUBLIC_ENV || ENVIRONMENT.DEVELOPMENT;
export const CURRENT_API_CONFIG = API_CONFIG[CURRENT_ENV];
```

### 환경 변수 설정

```bash
# .env.development
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api

# .env.staging
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_API_BASE_URL=https://staging-api.pyokemon.com

# .env.production
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://api.pyokemon.com
```
