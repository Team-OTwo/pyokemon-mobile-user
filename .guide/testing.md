# 테스트 가이드

Pyokemon 프로젝트의 테스트 가이드입니다. 이 문서는 테스트 환경 설정, 테스트 작성 방법, 테스트 실행 방법 등을 설명합니다.

## 테스트 환경 설정

### 필요한 패키지

```bash
# 테스트 관련 패키지 설치
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### Jest 설정

`package.json`에 다음과 같이 Jest 설정을 추가합니다:

```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  "setupFilesAfterEnv": [
    "@testing-library/jest-native/extend-expect"
  ],
  "collectCoverageFrom": [
    "**/*.{js,jsx,ts,tsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js"
  ]
}
```

## 테스트 파일 구조

테스트 파일은 다음과 같은 구조로 작성합니다:

```
components/
  ├── Button/
  │   ├── Button.tsx
  │   ├── Button.styles.ts
  │   ├── __tests__/
  │   │   └── Button.test.tsx
  │   └── index.ts
```

또는 컴포넌트와 같은 디렉토리에 `.test.tsx` 확장자로 작성할 수도 있습니다:

```
components/
  ├── Button/
  │   ├── Button.tsx
  │   ├── Button.test.tsx
  │   ├── Button.styles.ts
  │   └── index.ts
```

## 테스트 작성 예시

### 컴포넌트 테스트

```tsx
// components/Button/__tests__/Button.test.tsx
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

  it("applies disabled style when disabled", () => {
    const { getByTestId } = render(<Button title="Test Button" disabled testID="button" />);
    const button = getByTestId("button");

    // 스타일 테스트 예시
    expect(button).toHaveStyle({ opacity: 0.5 });
  });
});
```

### 훅 테스트

```tsx
// hooks/__tests__/useCounter.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import useCounter from "../useCounter";

describe("useCounter", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("should initialize with provided value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("should increment counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should decrement counter", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

### API 서비스 테스트

```tsx
// services/__tests__/pokemon.test.ts
import { getPokemonList, getPokemonDetail } from "../pokemon";

// API 모킹
jest.mock("../api", () => ({
  fetchApi: jest.fn(),
  fetchWithCache: jest.fn(),
}));

import { fetchApi, fetchWithCache } from "../api";

describe("Pokemon Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch pokemon list with default parameters", async () => {
    const mockResponse = {
      count: 1118,
      next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
      previous: null,
      results: [{ name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" }],
    };

    (fetchWithCache as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getPokemonList();

    expect(fetchWithCache).toHaveBeenCalledWith("/pokemon?limit=20&offset=0", expect.any(Number));
    expect(result).toEqual(mockResponse);
  });

  it("should fetch pokemon detail by id", async () => {
    const mockResponse = {
      id: 1,
      name: "bulbasaur",
      sprites: { front_default: "url-to-sprite" },
    };

    (fetchWithCache as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getPokemonDetail(1);

    expect(fetchWithCache).toHaveBeenCalledWith("/pokemon/1", expect.any(Number));
    expect(result).toEqual(mockResponse);
  });
});
```

## 테스트 실행

### 모든 테스트 실행

```bash
npm test
```

### 특정 테스트 파일 실행

```bash
npm test -- components/Button
```

### 테스트 감시 모드 실행 (파일 변경 시 자동으로 테스트 실행)

```bash
npm test -- --watch
```

### 테스트 커버리지 보고서 생성

```bash
npm test -- --coverage
```

커버리지 보고서는 `coverage/` 디렉토리에 생성됩니다. HTML 보고서는 `coverage/lcov-report/index.html`에서 확인할 수 있습니다.

## 테스트 모범 사례

1. **독립적인 테스트**: 각 테스트는 서로 독립적이어야 합니다. 한 테스트의 결과가 다른 테스트에 영향을 주지 않도록 하세요.

2. **모킹 사용**: 외부 의존성(API 호출, 네이티브 모듈 등)은 모킹하여 테스트하세요.

3. **스냅샷 테스트 활용**: UI 컴포넌트의 경우 스냅샷 테스트를 활용하여 의도하지 않은 UI 변경을 감지하세요.

4. **테스트 가독성**: 테스트 코드는 문서로서의 역할도 합니다. 명확한 테스트 설명과 구조화된 코드를 작성하세요.

5. **적절한 검증**: 단순히 함수가 호출되었는지만 확인하는 것이 아니라, 적절한 인자로 호출되었는지, 올바른 결과를 반환하는지 등을 검증하세요.

## E2E 테스트

더 복잡한 통합 테스트나 E2E 테스트를 위해 Detox를 사용할 수 있습니다. Detox 설정과 사용 방법은 별도의 문서에서 다룹니다.
