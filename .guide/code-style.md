# 코드 스타일 가이드

Pyokemon 프로젝트의 코드 스타일 가이드입니다. 이 문서는 일관된 코드 작성을 위한 규칙과 모범 사례를 설명합니다.

## 일반 원칙

1. **가독성 우선**: 코드는 작성하는 시간보다 읽는 시간이 더 많습니다. 항상 가독성을 최우선으로 고려하세요.
2. **일관성 유지**: 프로젝트 전체에서 일관된 스타일을 유지하세요.
3. **자체 문서화 코드**: 코드 자체가 그 의도를 명확히 표현할 수 있도록 작성하세요.
4. **간결함**: 불필요한 복잡성을 피하고 간결한 코드를 작성하세요.

## JavaScript / TypeScript 규칙

### 변수 선언

- `const`와 `let`을 사용하고, `var`는 사용하지 마세요.
- 가능한 한 `const`를 사용하세요.

```typescript
// 좋음
const name = "Pikachu";
let level = 25;

// 나쁨
var name = "Pikachu";
```

### 명명 규칙

- **변수 및 함수**: camelCase를 사용하세요.
- **클래스 및 컴포넌트**: PascalCase를 사용하세요.
- **상수**: 대문자와 언더스코어를 사용하세요.
- **파일 이름**: 컴포넌트는 PascalCase, 그 외에는 camelCase를 사용하세요.

```typescript
// 변수 및 함수 (camelCase)
const pokemonName = "Pikachu";
function getPokemonDetails() {
  /* ... */
}

// 클래스 및 컴포넌트 (PascalCase)
class PokemonTrainer {
  /* ... */
}
const PokemonCard = () => {
  /* ... */
};

// 상수 (대문자와 언더스코어)
const MAX_POKEMON_LEVEL = 100;
```

### 문자열

- 템플릿 리터럴과 작은따옴표를 사용하세요.

```typescript
// 좋음
const greeting = `Hello, ${name}!`;
const message = "This is a message.";

// 나쁨
const greeting = "Hello, " + name + "!";
```

### 배열과 객체

- 배열과 객체는 리터럴 문법을 사용하세요.
- 스프레드 연산자를 활용하세요.

```typescript
// 좋음
const pokemons = ["Pikachu", "Charmander", "Bulbasaur"];
const pokemon = { name: "Pikachu", type: "Electric" };
const updatedPokemon = { ...pokemon, level: 25 };

// 나쁨
const pokemons = new Array("Pikachu", "Charmander", "Bulbasaur");
const pokemon = new Object();
pokemon.name = "Pikachu";
pokemon.type = "Electric";
```

### 함수

- 화살표 함수를 사용하세요.
- 함수 매개변수에 기본값을 사용하세요.

```typescript
// 좋음
const getPokemonName = (pokemon) => pokemon.name;
const greetPokemon = (name = "Pikachu") => `Hello, ${name}!`;

// 나쁨
function getPokemonName(pokemon) {
  return pokemon.name;
}
```

### 조건문

- 삼항 연산자를 간단한 조건에 사용하세요.
- 복잡한 조건은 if/else 문을 사용하세요.

```typescript
// 좋음 (간단한 조건)
const status = pokemon.level > 50 ? "Strong" : "Weak";

// 좋음 (복잡한 조건)
let status;
if (pokemon.level > 50 && pokemon.evolution === "final") {
  status = "Very Strong";
} else if (pokemon.level > 50) {
  status = "Strong";
} else {
  status = "Weak";
}
```

### 비동기 코드

- Promise 대신 async/await를 사용하세요.
- 오류 처리를 위해 try/catch를 사용하세요.

```typescript
// 좋음
const fetchPokemon = async (id) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pokemon:", error);
    throw error;
  }
};

// 나쁨
const fetchPokemon = (id) => {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => {
      console.error("Error fetching pokemon:", error);
      throw error;
    });
};
```

## React Native 규칙

### 컴포넌트 구조

- 함수형 컴포넌트와 훅을 사용하세요.
- 각 컴포넌트는 단일 책임을 가져야 합니다.
- 컴포넌트 파일은 다음 구조를 따르세요:
  1. 임포트
  2. 타입 정의
  3. 컴포넌트 정의
  4. 스타일 정의
  5. 내보내기

```tsx
// PokemonCard.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type PokemonCardProps = {
  name: string;
  type: string;
  onPress: () => void;
};

const PokemonCard = ({ name, type, onPress }: PokemonCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.type}>{type}</Text>
      {isExpanded && <Text style={styles.description}>This is a Pokemon card.</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  type: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default PokemonCard;
```

### 컴포넌트 Props

- Props는 명확하게 타입을 정의하세요.
- 필수가 아닌 Props에는 기본값을 제공하세요.
- Props는 구조 분해 할당을 사용하세요.

```tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const Button = ({ title, onPress, disabled = false, style }: ButtonProps) => {
  // ...
};
```

### 상태 관리

- 지역 상태는 `useState`를 사용하세요.
- 복잡한 상태 로직은 `useReducer`를 사용하세요.
- 컴포넌트 간 상태 공유는 Context API를 사용하세요.
- 전역 상태 관리가 필요한 경우 Redux 또는 Zustand를 고려하세요.

```tsx
// 지역 상태
const [count, setCount] = useState(0);

// 복잡한 상태 로직
const [state, dispatch] = useReducer(reducer, initialState);

// Context API
const { theme, toggleTheme } = useThemeContext();
```

### 사이드 이펙트

- 사이드 이펙트는 `useEffect`를 사용하세요.
- 의존성 배열을 명확히 지정하세요.
- 정리(cleanup) 함수를 반환하세요.

```tsx
useEffect(() => {
  const subscription = api.subscribe((data) => {
    setData(data);
  });

  // 정리 함수
  return () => {
    subscription.unsubscribe();
  };
}, [api]); // 의존성 배열
```

### 성능 최적화

- 불필요한 리렌더링을 방지하기 위해 `React.memo`를 사용하세요.
- 콜백 함수는 `useCallback`으로 메모이제이션하세요.
- 계산 비용이 높은 값은 `useMemo`로 메모이제이션하세요.

```tsx
// 컴포넌트 메모이제이션
const MemoizedComponent = React.memo(MyComponent);

// 콜백 메모이제이션
const handlePress = useCallback(() => {
  // ...
}, [dependency]);

// 값 메모이제이션
const filteredData = useMemo(() => {
  return data.filter((item) => item.type === selectedType);
}, [data, selectedType]);
```

### 스타일링

- `StyleSheet.create`를 사용하여 스타일을 정의하세요.
- 인라인 스타일은 피하세요.
- 스타일 상속이 필요한 경우 스프레드 연산자를 사용하세요.

```tsx
// 좋음
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

// 스타일 상속
const buttonStyles = {
  ...styles.baseButton,
  backgroundColor: isActive ? "blue" : "gray",
};

// 나쁨
<View style={{ flex: 1, padding: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: "bold" }}>Title</Text>
</View>;
```

### 접근성

- 모든 상호작용 요소에 적절한 접근성 레이블을 제공하세요.
- 텍스트 크기는 상대적인 단위를 사용하세요.
- 색상 대비를 고려하세요.

```tsx
<TouchableOpacity
  accessibilityLabel="Pokemon details"
  accessibilityHint="Opens the Pokemon details screen"
  onPress={handlePress}
>
  <Text>View Details</Text>
</TouchableOpacity>
```

## 파일 및 폴더 구조

### 파일 명명 규칙

- 컴포넌트 파일: `PascalCase.tsx`
- 유틸리티 파일: `camelCase.ts`
- 테스트 파일: `ComponentName.test.tsx` 또는 `utilityName.test.ts`
- 스타일 파일: `ComponentName.styles.ts`

### 임포트 순서

1. 외부 라이브러리 임포트
2. 내부 컴포넌트 임포트
3. 훅, 유틸리티, 상수 임포트
4. 타입 임포트

```tsx
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

## 주석 작성

- 복잡한 로직에는 주석을 추가하세요.
- JSDoc 스타일의 주석을 사용하세요.
- 명확한 코드보다 주석을 선호하지 마세요.

```tsx
/**
 * 포켓몬의 레벨에 따라 경험치를 계산합니다.
 * @param level 현재 레벨
 * @returns 다음 레벨까지 필요한 경험치
 */
const calculateExperience = (level: number): number => {
  // 레벨이 높을수록 더 많은 경험치가 필요합니다
  return Math.floor(level * level * 1.5);
};
```

## 코드 리뷰 체크리스트

코드 리뷰 시 다음 항목을 확인하세요:

1. 코드가 스타일 가이드를 따르는가?
2. 컴포넌트가 단일 책임을 가지는가?
3. 적절한 타입이 정의되어 있는가?
4. 성능 최적화가 고려되었는가?
5. 테스트가 작성되었는가?
6. 접근성이 고려되었는가?
7. 오류 처리가 적절한가?
8. 코드가 재사용 가능한가?
9. 불필요한 의존성이 없는가?
10. 주석이 명확하고 유용한가?
