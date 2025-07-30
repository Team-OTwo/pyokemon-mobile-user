# Pyokemon

Pyokemon은 React Native와 Expo를 사용하여 개발된 모바일 애플리케이션입니다. 이 문서는 프로젝트를 진행하는 팀원들을 위한 가이드를 제공합니다.

## 목차

- [소개](#소개)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [문서](#문서)

## 소개

Pyokemon은 React Native와 Expo 프레임워크를 기반으로 한 모바일 애플리케이션입니다. 이 프로젝트는 일관된 코드 스타일과 구조를 유지하기 위해 팀 내에서 합의된 가이드라인을 따릅니다.

### 주요 특징

- 🎫 **티켓 관리**: QR 코드 기반 티켓 시스템
- 🔐 **인증 시스템**: 안전한 로그인/회원가입
- 📱 **크로스 플랫폼**: iOS, Android, Web 지원
- 🌙 **다크 모드**: 자동 테마 전환
- 📊 **실시간 알림**: 푸시 알림 시스템
- 🎨 **모던 UI**: 직관적이고 아름다운 인터페이스

## 시작하기

### 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Expo CLI
- iOS 시뮬레이터 또는 Android 에뮬레이터 (선택사항)
- Expo Go 앱 (실제 기기에서 테스트하는 경우)

### 설치 및 실행

1. 저장소 클론하기:

   ```bash
   git clone https://github.com/your-username/pyokemon.git
   cd pyokemon
   ```

2. 의존성 설치하기:

   ```bash
   npm install
   # 또는
   yarn install
   ```

3. 개발 서버 실행하기:

   ```bash
   npm start
   # 또는
   yarn start
   ```

4. 다양한 플랫폼에서 실행하기:

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # 웹
   npm run web
   ```

## 프로젝트 구조

```
pyokemon/
├── assets/                    # 정적 자산
│   ├── fonts/                # 커스텀 폰트
│   └── images/               # 이미지 파일
├── components/               # 재사용 가능한 UI 컴포넌트
│   ├── auth/                 # 인증 관련 컴포넌트
│   ├── common/               # 공통 컴포넌트
│   ├── ui/                   # 기본 UI 컴포넌트
│   └── index.ts              # 컴포넌트 메인 인덱스
├── constants/                # 상수 정의
│   ├── Colors.ts             # 색상 테마
│   ├── api-endpoints.ts      # API 엔드포인트
│   ├── app-config.ts         # 앱 설정
│   ├── navigation-constants.ts # 네비게이션 상수
│   └── index.ts              # 상수 메인 인덱스
├── data/                     # 정적 데이터
├── docs/                     # 프로젝트 문서
├── hooks/                    # 커스텀 훅
├── screens/                  # 화면 컴포넌트
├── services/                 # 서비스 레이어
│   ├── api/                  # API 클라이언트
│   ├── auth/                 # 인증 서비스
│   ├── storage/              # 스토리지 서비스
│   └── index.ts              # 서비스 메인 인덱스
├── types/                    # TypeScript 타입 정의
├── utils/                    # 유틸리티 함수
├── App.tsx                   # 앱 진입점
├── app.json                  # Expo 설정
├── package.json              # npm 패키지 정보
└── tsconfig.json             # TypeScript 설정
```

자세한 구조 설명은 [프로젝트 구조 가이드](./docs/project-structure.md)를 참조하세요.

## 주요 기능

### 🎫 티켓 관리

- QR 코드 생성 및 스캔
- 티켓 상태 추적 (활성/사용됨/만료)
- 티켓 상세 정보 조회

### 🔐 인증 시스템

- 이메일/비밀번호 로그인
- 회원가입
- 토큰 기반 인증
- 자동 토큰 갱신

### 📱 사용자 인터페이스

- 직관적인 네비게이션
- 다크/라이트 모드 지원
- 반응형 디자인
- 햅틱 피드백

### 📊 알림 시스템

- 실시간 푸시 알림
- 알림 읽음 처리
- 알림 설정 관리

## 기술 스택

### 프레임워크 & 라이브러리

- **React Native**: 0.79.5
- **Expo**: SDK 53
- **TypeScript**: 5.8.3
- **React Navigation**: 7.x

### 상태 관리

- **React Hooks**: useState, useEffect, useContext
- **Custom Hooks**: 재사용 가능한 로직

### UI/UX

- **Expo Vector Icons**: 아이콘 시스템
- **React Native Reanimated**: 애니메이션
- **Expo Haptics**: 햅틱 피드백

### 개발 도구

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안전성

## 개발 가이드

### 코드 스타일

이 프로젝트는 일관된 코드 스타일을 유지하기 위해 다음 규칙을 따릅니다:

- **파일명**: kebab-case (예: `auth-input.tsx`)
- **컴포넌트명**: PascalCase (예: `AuthInput`)
- **변수명**: camelCase (예: `userProfile`)
- **상수명**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)

자세한 코딩 표준은 [코딩 표준 가이드](./docs/coding-standards.md)를 참조하세요.

### 컴포넌트 개발

```typescript
// components/auth/auth-input.tsx
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { ThemedText } from "@/components/common";

interface AuthInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
}

export function AuthInput({ label, value, onChangeText, placeholder, secureTextEntry = false, error }: AuthInputProps) {
  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
      />
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
});
```

### API 서비스 사용

```typescript
// services/auth/auth-service.ts
import { apiClient } from "@/services/api/api-client";
import { API_ENDPOINTS } from "@/constants";

export class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }
}

// 컴포넌트에서 사용
import { authService } from "@/services";

const handleLogin = async () => {
  try {
    const response = await authService.login({ email, password });
    if (response.success) {
      // 로그인 성공 처리
    }
  } catch (error) {
    // 에러 처리
  }
};
```

### 테마 시스템

```typescript
// hooks/useThemeColor.ts
import { useColorScheme } from "react-native";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}

// 컴포넌트에서 사용
export function ThemedButton() {
  const backgroundColor = useThemeColor({ light: "#007AFF", dark: "#0A84FF" }, "background");

  return (
    <View style={[styles.button, { backgroundColor }]}>
      <Text>Button</Text>
    </View>
  );
}
```

## 배포

### 개발 환경

```bash
# 개발 빌드
eas build --profile development

# 로컬 개발 서버
npm start
```

### 스테이징 환경

```bash
# 스테이징 빌드
eas build --profile preview
```

### 프로덕션 환경

```bash
# 프로덕션 빌드
eas build --profile production

# 앱 스토어 제출
eas submit --platform all --profile production
```

자세한 배포 가이드는 [배포 가이드](./docs/deployment-guide.md)를 참조하세요.

## 문서

프로젝트 관련 상세 문서는 `docs/` 디렉토리에서 확인할 수 있습니다:

- [프로젝트 구조 가이드](./docs/project-structure.md)
- [코딩 표준 가이드](./docs/coding-standards.md)
- [API 문서화 가이드](./docs/api-documentation.md)
- [배포 가이드](./docs/deployment-guide.md)

## 기여하기

1. 이슈를 생성하거나 기존 이슈를 확인하세요
2. 새로운 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

프로젝트에 대한 질문이나 문제가 있으시면:

1. [Issues](../../issues)에서 기존 이슈를 확인하세요
2. 새로운 이슈를 생성하세요
3. 팀원들과 논의하세요

---

**Pyokemon** - 티켓 관리의 새로운 경험을 만들어갑니다 🎫
