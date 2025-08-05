# 프로젝트 구조 가이드

## 개요

Pyokemon 프로젝트는 React Native와 Expo를 기반으로 한 모바일 애플리케이션입니다. 이 문서는 프로젝트의 디렉토리 구조와 각 폴더의 역할을 설명합니다.

## 전체 디렉토리 구조

```
pyokemon/
├── assets/                    # 정적 자산
│   ├── fonts/                # 커스텀 폰트
│   └── images/               # 이미지 파일
├── components/               # 재사용 가능한 UI 컴포넌트
│   ├── auth/                 # 인증 관련 컴포넌트
│   │   ├── auth-button.tsx
│   │   ├── auth-input.tsx
│   │   └── index.ts
│   ├── common/               # 공통 컴포넌트
│   │   ├── collapsible.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── hello-wave.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── svg-logo.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   └── index.ts
│   ├── ui/                   # 기본 UI 컴포넌트
│   │   ├── icon-symbol.tsx
│   │   ├── tab-bar-background.tsx
│   │   └── index.ts
│   └── index.ts              # 컴포넌트 메인 인덱스
├── constants/                # 상수 정의
│   ├── Colors.ts             # 색상 테마
│   ├── api-endpoints.ts      # API 엔드포인트
│   ├── app-config.ts         # 앱 설정
│   ├── navigation-constants.ts # 네비게이션 상수
│   └── index.ts              # 상수 메인 인덱스
├── data/                     # 정적 데이터
│   ├── notification.ts
│   └── ticket.ts
├── docs/                     # 프로젝트 문서
│   ├── project-structure.md
│   ├── coding-standards.md
│   ├── api-documentation.md
│   └── deployment-guide.md
├── hooks/                    # 커스텀 훅
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   ├── useThemeColor.ts
│   └── useTicketFilters.ts
├── screens/                  # 화면 컴포넌트
│   ├── home/
│   │   ├── _components/
│   │   │   ├── RequestVCButton.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   └── TicketList.tsx
│   │   └── home-page.tsx
│   ├── login/
│   │   └── login-page.tsx
│   ├── notification/
│   │   ├── _components/
│   │   │   └── notification-item.tsx
│   │   └── notification-page.tsx
│   ├── profile/
│   │   └── profile-page.tsx
│   ├── signup/
│   │   └── signup-page.tsx
│   ├── splash/
│   │   └── splash-page.tsx
│   ├── ticket/
│   │   └── ticket-detail-page.tsx
│   └── ticket-qr/
│       ├── _components/
│       │   ├── entry-complete.tsx
│       │   ├── page-header.tsx
│       │   ├── qr-display.tsx
│       │   ├── qr-scanner.tsx
│       │   └── test-button.tsx
│       ├── hooks/
│       │   ├── use-camera-permission.ts
│       │   └── use-qr-process.ts
│       └── ticket-qr-page.tsx
├── services/                 # 서비스 레이어
│   ├── api/
│   │   └── api-client.ts
│   ├── auth/
│   │   └── auth-service.ts
│   ├── storage/
│   │   └── async-storage.ts
│   └── index.ts
├── types/                    # TypeScript 타입 정의
│   ├── navigation.ts
│   └── ticket.ts
├── utils/                    # 유틸리티 함수
│   ├── ticket.utils.ts
│   └── timer.utils.ts
├── App.tsx                   # 앱 진입점
├── app.json                  # Expo 설정
├── package.json              # 의존성 관리
├── tsconfig.json             # TypeScript 설정
└── README.md                 # 프로젝트 메인 문서
```

## 주요 디렉토리 설명

### 📁 `components/`

재사용 가능한 UI 컴포넌트들을 관리합니다.

#### `components/auth/`

- **auth-button.tsx**: 인증 관련 버튼 컴포넌트
- **auth-input.tsx**: 인증 관련 입력 필드 컴포넌트

#### `components/common/`

- **themed-text.tsx**: 테마 적용된 텍스트 컴포넌트
- **themed-view.tsx**: 테마 적용된 뷰 컴포넌트
- **svg-logo.tsx**: SVG 로고 컴포넌트
- **collapsible.tsx**: 접을 수 있는 컴포넌트
- **external-link.tsx**: 외부 링크 컴포넌트
- **hello-wave.tsx**: 인사말 컴포넌트
- **parallax-scroll-view.tsx**: 패럴랙스 스크롤 뷰
- **haptic-tab.tsx**: 햅틱 피드백 탭 컴포넌트

#### `components/ui/`

- **icon-symbol.tsx**: 아이콘 심볼 컴포넌트
- **tab-bar-background.tsx**: 탭바 배경 컴포넌트

### 📁 `constants/`

앱에서 사용되는 모든 상수들을 중앙에서 관리합니다.

- **Colors.ts**: 색상 테마 정의
- **api-endpoints.ts**: API 엔드포인트 정의
- **app-config.ts**: 앱 설정 상수
- **navigation-constants.ts**: 네비게이션 관련 상수

### 📁 `services/`

비즈니스 로직과 외부 API 통신을 담당합니다.

#### `services/api/`

- **api-client.ts**: HTTP 클라이언트 기본 설정

#### `services/auth/`

- **auth-service.ts**: 인증 관련 API 호출

#### `services/storage/`

- **async-storage.ts**: 로컬 데이터 저장 관리

### 📁 `screens/`

각 화면별 컴포넌트를 관리합니다. 각 화면은 독립적인 디렉토리를 가지며, 해당 화면에서만 사용되는 컴포넌트는 `_components/` 폴더에 배치합니다.

### 📁 `hooks/`

커스텀 React 훅들을 관리합니다.

- **useColorScheme.ts**: 색상 스키마 관리
- **useThemeColor.ts**: 테마 색상 관리
- **useTicketFilters.ts**: 티켓 필터링 로직

### 📁 `types/`

TypeScript 타입 정의를 관리합니다.

- **navigation.ts**: 네비게이션 타입 정의
- **ticket.ts**: 티켓 관련 타입 정의

### 📁 `utils/`

유틸리티 함수들을 관리합니다.

- **ticket.utils.ts**: 티켓 관련 유틸리티
- **timer.utils.ts**: 타이머 관련 유틸리티

## 네이밍 컨벤션

### 파일명

- **kebab-case** 사용 (예: `auth-input.tsx`, `ticket-detail-page.tsx`)
- 컴포넌트 파일은 기능을 명확히 표현

### 디렉토리명

- **kebab-case** 사용 (예: `ticket-qr/`, `auth/`)
- 기능별로 그룹화

### 컴포넌트명

- **PascalCase** 사용 (예: `AuthInput`, `TicketCard`)

### 상수명

- **UPPER_SNAKE_CASE** 사용 (예: `API_BASE_URL`, `SPLASH_DURATION`)

## 모듈 구조

각 주요 디렉토리는 `index.ts` 파일을 통해 모듈을 export합니다:

```typescript
// components/index.ts
export * from "./auth";
export * from "./common";
export * from "./ui";

// constants/index.ts
export * from "./Colors";
export * from "./api-endpoints";
export * from "./app-config";
export * from "./navigation-constants";
```

이를 통해 깔끔한 import 구문을 사용할 수 있습니다:

```typescript
import { AuthInput, ThemedText } from "@/components";
import { API_ENDPOINTS, APP_CONFIG } from "@/constants";
```

## 확장 가이드

### 새로운 컴포넌트 추가

1. 적절한 카테고리 디렉토리 선택 (`auth/`, `common/`, `ui/`)
2. kebab-case로 파일명 작성
3. 해당 디렉토리의 `index.ts`에 export 추가

### 새로운 서비스 추가

1. `services/` 디렉토리 내 적절한 하위 디렉토리 생성
2. 서비스 클래스 구현
3. `services/index.ts`에 export 추가

### 새로운 상수 추가

1. 적절한 상수 파일 선택 또는 새 파일 생성
2. 상수 정의
3. `constants/index.ts`에 export 추가
