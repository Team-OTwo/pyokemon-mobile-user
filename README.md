# Pyokemon

Pyokemon은 React Native와 Expo를 사용하여 개발된 모바일 애플리케이션입니다. 이 문서는 프로젝트를 진행하는 팀원들을 위한 가이드를 제공합니다.

## 목차

- [소개](#소개)
- [시작하기](#시작하기)
- [폴더 구조](#폴더-구조)
- [파일 컨벤션](#파일-컨벤션)
- [네이밍 컨벤션](#네이밍-컨벤션)
- [테스트](#테스트)
- [코드 스타일 가이드](#코드-스타일-가이드)
- [상세 가이드 문서](#상세-가이드-문서)

## 소개

Pyokemon은 React Native와 Expo 프레임워크를 기반으로 한 모바일 애플리케이션입니다. 이 프로젝트는 일관된 코드 스타일과 구조를 유지하기 위해 팀 내에서 합의된 가이드라인을 따릅니다.

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

## 폴더 구조

```
pyokemon/
├── app/                    # Expo Router 기반 화면 컴포넌트
│   ├── (tabs)/             # 탭 기반 화면
│   │   ├── _layout.tsx     # 탭 레이아웃 설정
│   │   ├── index.tsx       # 홈 화면
│   │   └── explore.tsx     # 탐색 화면
│   ├── _layout.tsx         # 앱 전체 레이아웃
│   └── +not-found.tsx      # 404 페이지
├── assets/                 # 이미지, 폰트 등 정적 자산
│   ├── fonts/              # 커스텀 폰트
│   └── images/             # 이미지 파일
├── components/             # 재사용 가능한 UI 컴포넌트
│   ├── ui/                 # 기본 UI 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   └── feature/            # 기능별 컴포넌트
├── constants/              # 상수 정의
│   ├── Colors.ts           # 색상 테마
│   ├── Layout.ts           # 레이아웃 관련 상수
│   └── Api.ts              # API 관련 상수
├── hooks/                  # 커스텀 훅
├── services/               # API 서비스 및 외부 통신
├── utils/                  # 유틸리티 함수
├── types/                  # TypeScript 타입 정의
├── store/                  # 상태 관리 (Context API, Redux 등)
├── .guide/                 # 상세 가이드 문서
│   ├── setup.md            # 프로젝트 설정 가이드
│   ├── testing.md          # 테스트 가이드
│   └── code-style.md       # 코드 스타일 상세 가이드
├── app.json                # Expo 설정 파일
├── package.json            # npm 패키지 정보
└── tsconfig.json           # TypeScript 설정
```

## 파일 컨벤션

1. **파일 확장자**:

   - React 컴포넌트: `.tsx`
   - 일반 TypeScript 파일: `.ts`
   - 스타일 파일: 컴포넌트 내 StyleSheet 사용

2. **파일 구조**:

   - 각 컴포넌트는 자체 파일에 정의
   - 복잡한 컴포넌트의 경우 디렉토리 생성 후 index.tsx로 내보내기

3. **임포트 순서**:

   ```typescript
   // 1. 외부 라이브러리
   import React, { useState, useEffect } from "react";
   import { View, Text } from "react-native";

   // 2. 내부 컴포넌트
   import { Button } from "../components/ui";

   // 3. 훅, 유틸리티, 상수
   import { useThemeColor } from "../hooks";
   import { formatDate } from "../utils";
   import { Colors } from "../constants";

   // 4. 타입
   import type { Pokemon } from "../types";
   ```

## 네이밍 컨벤션

1. **변수 및 함수**:

   - camelCase 사용 (예: `isFetchingData`, `handleUserInput`)

2. **컴포넌트**:

   - PascalCase 사용 (예: `PokemonCard`, `BattleScreen`)

3. **디렉토리**:

   - 소문자와 하이픈 사용 (예: `pokemon-detail`, `battle-arena`)

4. **상수**:

   - 대문자와 언더스코어 사용 (예: `MAX_POKEMON_COUNT`, `API_BASE_URL`)

5. **인터페이스 및 타입**:
   - PascalCase 사용, 인터페이스는 'I' 접두사 없이 (예: `Pokemon`, `BattleProps`)

## 테스트

1. **테스트 파일 위치**:

   - 컴포넌트와 동일한 디렉토리에 `__tests__` 폴더 생성
   - 테스트 파일은 `.test.tsx` 또는 `.spec.tsx` 확장자 사용

2. **테스트 도구**:

   - Jest와 React Native Testing Library 사용

3. **테스트 실행**:

   ```bash
   npm test
   # 또는
   yarn test
   ```

4. **테스트 커버리지**:

   ```bash
   npm test -- --coverage
   # 또는
   yarn test --coverage
   ```

5. **테스트 예시**:

   ```tsx
   // Button.test.tsx
   import React from "react";
   import { render, fireEvent } from "@testing-library/react-native";
   import Button from "../Button";

   describe("Button", () => {
     it("renders correctly", () => {
       const { getByText } = render(<Button title="Test Button" />);
       expect(getByText("Test Button")).toBeTruthy();
     });

     it("calls onPress when pressed", () => {
       const onPressMock = jest.fn();
       const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);

       fireEvent.press(getByText("Test Button"));
       expect(onPressMock).toHaveBeenCalledTimes(1);
     });
   });
   ```

자세한 테스트 가이드는 [테스트 가이드 문서](./.guide/testing.md)를 참조하세요.

## 코드 스타일 가이드

### 코드 스타일 및 구조

- **깔끔하고 읽기 쉬운 코드 작성**: 코드는 읽기 쉽고 이해하기 쉬워야 합니다. 변수와 함수에 설명적인 이름을 사용하세요.
- **함수형 컴포넌트 사용**: 클래스 컴포넌트보다 훅(useState, useEffect 등)을 사용한 함수형 컴포넌트를 선호합니다.
- **컴포넌트 모듈화**: 컴포넌트를 작고 재사용 가능한 조각으로 분리하세요. 컴포넌트는 단일 책임에 집중해야 합니다.
- **기능별 파일 구성**: 관련된 컴포넌트, 훅, 스타일을 기능 기반 디렉토리로 그룹화하세요.

### JavaScript 사용법

- **전역 변수 피하기**: 의도하지 않은 부작용을 방지하기 위해 전역 변수 사용을 최소화하세요.
- **ES6+ 기능 사용**: 화살표 함수, 구조 분해 할당, 템플릿 리터럴과 같은 ES6+ 기능을 활용하여 간결한 코드를 작성하세요.
- **PropTypes**: TypeScript를 사용하지 않는 경우 컴포넌트에서 타입 검사를 위해 PropTypes를 사용하세요.

### 성능 최적화

- **상태 관리 최적화**: 불필요한 상태 업데이트를 피하고 필요할 때만 로컬 상태를 사용하세요.
- **메모이제이션**: 불필요한 리렌더링을 방지하기 위해 함수형 컴포넌트에 React.memo()를 사용하세요.
- **FlatList 최적화**: removeClippedSubviews, maxToRenderPerBatch, windowSize와 같은 속성으로 FlatList를 최적화하세요.
- **익명 함수 사용 자제**: 리렌더링을 방지하기 위해 renderItem 또는 이벤트 핸들러에서 익명 함수 사용을 자제하세요.

### UI 및 스타일링

- **일관된 스타일링**: 일관된 스타일링을 위해 StyleSheet.create()를 사용하거나 동적 스타일을 위해 Styled Components를 사용하세요.
- **반응형 디자인**: 디자인이 다양한 화면 크기와 방향에 적응하도록 하세요. react-native-responsive-screen과 같은 라이브러리를 사용하는 것을 고려하세요.
- **이미지 처리 최적화**: 이미지를 효율적으로 처리하기 위해 react-native-fast-image와 같은 최적화된 이미지 라이브러리를 사용하세요.

### 모범 사례

- **React Native의 스레딩 모델 준수**: 원활한 UI 성능을 보장하기 위해 React Native가 스레딩을 처리하는 방식을 인지하세요.
- **Expo 도구 활용**: 지속적인 배포 및 Over-The-Air(OTA) 업데이트를 위해 Expo의 EAS Build 및 Updates를 활용하세요.
- **Expo Router**: React Native 앱에서 파일 기반 라우팅을 위해 Expo Router를 사용하세요. 네이티브 내비게이션, 딥 링크를 제공하며 Android, iOS 및 웹에서 작동합니다.

자세한 코드 스타일 가이드는 [코드 스타일 가이드 문서](./.guide/code-style.md)를 참조하세요.

## 상세 가이드 문서

더 자세한 가이드는 `.guide` 디렉토리의 문서를 참조하세요:

- [프로젝트 설정 가이드](./.guide/setup.md): 개발 환경 설정, 프로젝트 구조, 개발 시 주의사항 등을 설명합니다.
- [테스트 가이드](./.guide/testing.md): 테스트 환경 설정, 테스트 작성 방법, 테스트 실행 방법 등을 설명합니다.
- [코드 스타일 상세 가이드](./.guide/code-style.md): 일관된 코드 작성을 위한 규칙과 모범 사례를 설명합니다.
