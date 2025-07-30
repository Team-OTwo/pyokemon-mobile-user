# 코딩 표준 및 모범 사례

## 개요

이 문서는 Pyokemon 프로젝트에서 일관된 코드 품질을 유지하기 위한 코딩 표준과 모범 사례를 정의합니다.

## TypeScript 표준

### 타입 정의

```typescript
// ✅ 좋은 예
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

// ❌ 나쁜 예
interface UserProfile {
  id: any;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: any;
}
```

### 함수 타입 정의

```typescript
// ✅ 좋은 예
type OnPressHandler = (id: string) => void;
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// ❌ 나쁜 예
type OnPressHandler = (id: any) => any;
```

## React Native 컴포넌트 표준

### 함수형 컴포넌트 사용

```typescript
// ✅ 좋은 예
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <View style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.text} onPress={onPress}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
```

### Props 인터페이스 정의

```typescript
// ✅ 좋은 예
interface CardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

// ❌ 나쁜 예
interface CardProps {
  title: any;
  subtitle: any;
  imageUrl: any;
  onPress: any;
  children: any;
}
```

## 네이밍 컨벤션

### 파일명

- **kebab-case** 사용
- 기능을 명확히 표현

```typescript
// ✅ 좋은 예
auth - input.tsx;
ticket - detail - page.tsx;
use - ticket - filters.ts;

// ❌ 나쁜 예
AuthInput.tsx;
ticketDetailPage.tsx;
useTicketFilters.ts;
```

### 변수명

- **camelCase** 사용
- 설명적인 이름 사용

```typescript
// ✅ 좋은 예
const userProfile = await getUserProfile();
const isAuthenticated = checkAuthStatus();
const handleLoginPress = () => {};

// ❌ 나쁜 예
const up = await getUserProfile();
const auth = checkAuthStatus();
const login = () => {};
```

### 상수명

- **UPPER_SNAKE_CASE** 사용

```typescript
// ✅ 좋은 예
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_COUNT = 3;
const SPLASH_DURATION = 3000;

// ❌ 나쁜 예
const apiBaseUrl = "https://api.example.com";
const maxRetryCount = 3;
const splashDuration = 3000;
```

### 컴포넌트명

- **PascalCase** 사용

```typescript
// ✅ 좋은 예
export function UserProfile() {}
export function TicketCard() {}
export function AuthButton() {}

// ❌ 나쁜 예
export function userProfile() {}
export function ticketCard() {}
export function authButton() {}
```

## 스타일링 표준

### StyleSheet 사용

```typescript
// ✅ 좋은 예
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
});

// ❌ 나쁜 예
const styles = {
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
};
```

### 테마 색상 사용

```typescript
// ✅ 좋은 예
import { useThemeColor } from "@/hooks/useThemeColor";

export function ThemedButton() {
  const backgroundColor = useThemeColor({ light: "#007AFF", dark: "#0A84FF" }, "background");
  const textColor = useThemeColor({ light: "#FFFFFF", dark: "#FFFFFF" }, "text");

  return (
    <View style={[styles.button, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Button</Text>
    </View>
  );
}

// ❌ 나쁜 예
export function ThemedButton() {
  return (
    <View style={{ backgroundColor: "#007AFF" }}>
      <Text style={{ color: "#FFFFFF" }}>Button</Text>
    </View>
  );
}
```

## 상태 관리 표준

### useState 사용

```typescript
// ✅ 좋은 예
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loginUser(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput value={email} onChangeText={setEmail} placeholder="이메일" keyboardType="email-address" />
      <TextInput value={password} onChangeText={setPassword} placeholder="비밀번호" secureTextEntry />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={isLoading ? "로그인 중..." : "로그인"} onPress={handleLogin} disabled={isLoading} />
    </View>
  );
}
```

### 커스텀 훅 사용

```typescript
// ✅ 좋은 예
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
  };
}

// 컴포넌트에서 사용
export function LoginScreen() {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
  };
}
```

## 에러 처리 표준

### try-catch 사용

```typescript
// ✅ 좋은 예
const handleApiCall = async () => {
  try {
    setIsLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (error) {
    console.error("API 호출 실패:", error);
    setError(error.message || "알 수 없는 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};

// ❌ 나쁜 예
const handleApiCall = async () => {
  setIsLoading(true);
  const response = await apiService.getData();
  setData(response.data);
  setIsLoading(false);
};
```

### 에러 바운더리 사용

```typescript
// ✅ 좋은 예
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>문제가 발생했습니다.</Text>
          <Button title="다시 시도" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

## 성능 최적화 표준

### React.memo 사용

```typescript
// ✅ 좋은 예
interface UserCardProps {
  user: User;
  onPress: (userId: string) => void;
}

export const UserCard = React.memo<UserCardProps>(({ user, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(user.id)}>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
    </TouchableOpacity>
  );
});

// ❌ 나쁜 예
export function UserCard({ user, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(user.id)}>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
    </TouchableOpacity>
  );
}
```

### useCallback 사용

```typescript
// ✅ 좋은 예
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  const handleUserPress = useCallback(
    (userId: string) => {
      // 사용자 상세 페이지로 이동
      navigation.navigate("UserDetail", { userId });
    },
    [navigation]
  );

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} onPress={handleUserPress} />}
      keyExtractor={(item) => item.id}
    />
  );
}

// ❌ 나쁜 예
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <UserCard user={item} onPress={(userId) => navigation.navigate("UserDetail", { userId })} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## 테스트 표준

### 컴포넌트 테스트

```typescript
// ✅ 좋은 예
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} disabled />);

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

## 주석 표준

### JSDoc 주석

```typescript
/**
 * 사용자 인증 상태를 관리하는 훅
 * @returns 인증 관련 상태와 함수들
 */
export function useAuth() {
  // ...
}

/**
 * 사용자 로그인 함수
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @returns 로그인 결과
 * @throws {Error} 로그인 실패 시 에러
 */
async function loginUser(email: string, password: string): Promise<AuthResponse> {
  // ...
}
```

### 인라인 주석

```typescript
// ✅ 좋은 예
// 사용자 데이터를 가져오는 API 호출
const userData = await fetchUserData(userId);

// 로딩 상태 업데이트
setIsLoading(false);

// ❌ 나쁜 예
// 데이터 가져오기
const userData = await fetchUserData(userId);

// false로 설정
setIsLoading(false);
```

## Git 커밋 메시지 표준

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 종류

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스 또는 보조 도구 변경

### 예시

```
feat(auth): 로그인 기능 구현

- 이메일/비밀번호 로그인 추가
- 토큰 기반 인증 구현
- 로그인 상태 관리 훅 추가

Closes #123
```

```
fix(ui): 버튼 컴포넌트 스타일 수정

- 버튼 높이 일관성 문제 해결
- 다크 모드에서 텍스트 색상 개선

Fixes #456
```
