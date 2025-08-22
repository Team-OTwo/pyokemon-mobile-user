# 배포 가이드

## 개요

이 문서는 Pyokemon React Native 앱의 배포 프로세스를 설명합니다.

## 배포 환경

### 개발 환경 (Development)

- **목적**: 개발 및 테스트
- **API**: 개발 서버
- **설정**: 디버그 모드, 로그 활성화

### 스테이징 환경 (Staging)

- **목적**: QA 및 사용자 테스트
- **API**: 스테이징 서버
- **설정**: 프로덕션과 유사한 설정

### 프로덕션 환경 (Production)

- **목적**: 실제 사용자 서비스
- **API**: 프로덕션 서버
- **설정**: 최적화된 설정, 로그 최소화

## Expo 배포 프로세스

### 1. 환경 설정

#### 환경 변수 파일 생성

```bash
# .env.development
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_NAME=Pyokemon Dev

# .env.staging
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_API_BASE_URL=https://staging-api.pyokemon.com
EXPO_PUBLIC_APP_NAME=Pyokemon Staging

# .env.production
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://api.pyokemon.com
EXPO_PUBLIC_APP_NAME=Pyokemon
```

#### app.json 설정

```json
{
  "expo": {
    "name": "Pyokemon",
    "slug": "pyokemon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pyokemon.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.pyokemon.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. EAS Build 설정

#### eas.json 생성

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. 빌드 명령어

#### 개발 빌드

```bash
# iOS 개발 빌드
eas build --platform ios --profile development

# Android 개발 빌드
eas build --platform android --profile development

# 모든 플랫폼 개발 빌드
eas build --profile development
```

#### 스테이징 빌드

```bash
# iOS 스테이징 빌드
eas build --platform ios --profile preview

# Android 스테이징 빌드
eas build --platform android --profile preview

# 모든 플랫폼 스테이징 빌드
eas build --profile preview
```

#### 프로덕션 빌드

```bash
# iOS 프로덕션 빌드
eas build --platform ios --profile production

# Android 프로덕션 빌드
eas build --platform android --profile production

# 모든 플랫폼 프로덕션 빌드
eas build --profile production
```

### 4. 앱 스토어 배포

#### iOS App Store 배포

```bash
# 빌드 및 제출
eas submit --platform ios --profile production
```

#### Google Play Store 배포

```bash
# 빌드 및 제출
eas submit --platform android --profile production
```

## CI/CD 파이프라인

### GitHub Actions 설정

#### .github/workflows/build-and-deploy.yml

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

  build-development:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g @expo/eas-cli

      - name: Login to Expo
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build for development
        run: eas build --platform all --profile development --non-interactive

  build-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g @expo/eas-cli

      - name: Login to Expo
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build for staging
        run: eas build --platform all --profile preview --non-interactive

  build-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g @expo/eas-cli

      - name: Login to Expo
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build for production
        run: eas build --platform all --profile production --non-interactive

      - name: Submit to stores
        run: eas submit --platform all --profile production --non-interactive
```

## 환경별 설정 관리

### 개발 환경

```typescript
// constants/environment.ts
export const getEnvironmentConfig = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';

  switch (env) {
    case 'development':
      return {
        apiBaseUrl: 'http://localhost:3000/api',
        appName: 'Pyokemon Dev',
        enableLogs: true,
        enableAnalytics: false,
      };
    case 'staging':
      return {
        apiBaseUrl: 'https://staging-api.pyokemon.com',
        appName: 'Pyokemon Staging',
        enableLogs: true,
        enableAnalytics: true,
      };
    case 'production':
      return {
        apiBaseUrl: 'https://api.pyokemon.com',
        appName: 'Pyokemon',
        enableLogs: false,
        enableAnalytics: true,
      };
    default:
      return {
        apiBaseUrl: 'http://localhost:3000/api',
        appName: 'Pyokemon Dev',
        enableLogs: true,
        enableAnalytics: false,
      };
  }
};
```

### 로깅 설정

```typescript
// utils/logger.ts
import { getEnvironmentConfig } from '@/constants/environment';

class Logger {
  private config = getEnvironmentConfig();

  log(message: string, data?: any) {
    if (this.config.enableLogs) {
      console.log(`[${new Date().toISOString()}] ${message}`, data);
    }
  }

  error(message: string, error?: any) {
    if (this.config.enableLogs) {
      console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
    }
  }

  warn(message: string, data?: any) {
    if (this.config.enableLogs) {
      console.warn(`[${new Date().toISOString()}] WARN: ${message}`, data);
    }
  }
}

export const logger = new Logger();
```

## 모니터링 및 분석

### Crashlytics 설정

```typescript
// services/analytics/crashlytics.ts
import { getEnvironmentConfig } from '@/constants/environment';

class Crashlytics {
  private config = getEnvironmentConfig();

  init() {
    if (this.config.enableAnalytics) {
      // Crashlytics 초기화
      console.log('Crashlytics initialized');
    }
  }

  logError(error: Error, context?: any) {
    if (this.config.enableAnalytics) {
      // 에러 로깅
      console.error('Crashlytics error logged:', error, context);
    }
  }

  setUser(userId: string) {
    if (this.config.enableAnalytics) {
      // 사용자 ID 설정
      console.log('Crashlytics user set:', userId);
    }
  }
}

export const crashlytics = new Crashlytics();
```

### 성능 모니터링

```typescript
// services/analytics/performance.ts
import { getEnvironmentConfig } from '@/constants/environment';

class PerformanceMonitor {
  private config = getEnvironmentConfig();

  startTrace(traceName: string) {
    if (this.config.enableAnalytics) {
      console.log(`Performance trace started: ${traceName}`);
      return {
        stop: () => {
          console.log(`Performance trace stopped: ${traceName}`);
        },
        addMetric: (metricName: string, value: number) => {
          console.log(`Performance metric added: ${metricName} = ${value}`);
        },
      };
    }

    return {
      stop: () => {},
      addMetric: () => {},
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## 롤백 전략

### 자동 롤백

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_run:
    workflows: ['Build and Deploy']
    types:
      - completed

jobs:
  rollback-check:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    steps:
      - name: Check for critical errors
        run: |
          # 크리티컬 에러 체크 로직
          echo "Critical errors detected, initiating rollback"

      - name: Trigger rollback
        run: |
          # 롤백 트리거
          echo "Rollback triggered"
```

### 수동 롤백

```bash
# 이전 버전으로 롤백
git checkout <previous-version-tag>
eas build --platform all --profile production
eas submit --platform all --profile production
```

## 보안 고려사항

### API 키 관리

```typescript
// constants/secrets.ts
export const getApiKeys = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';

  return {
    // 환경별 API 키 설정
    [env]: {
      // 프로덕션에서는 환경 변수에서 가져오기
      apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
      analyticsKey: process.env.EXPO_PUBLIC_ANALYTICS_KEY || '',
    },
  };
};
```

### 코드 난독화

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## 문서화

### 배포 노트 템플릿

```markdown
# 배포 노트 v1.0.0

## 새로운 기능

- 사용자 인증 시스템 추가
- 티켓 QR 코드 스캔 기능
- 알림 시스템 구현

## 개선사항

- 앱 성능 최적화
- UI/UX 개선
- 에러 처리 강화

## 버그 수정

- 로그인 화면 레이아웃 문제 해결
- QR 스캔 시 크래시 문제 해결

## 기술적 변경사항

- React Native 0.79.5 업그레이드
- Expo SDK 53 업그레이드
- TypeScript 설정 개선

## 알려진 이슈

- Android 12 이하에서 카메라 권한 문제 (다음 버전에서 수정 예정)

## 테스트 완료 항목

- [ ] 로그인/회원가입
- [ ] 티켓 목록 조회
- [ ] QR 코드 스캔
- [ ] 알림 기능
- [ ] 다크 모드
- [ ] iOS/Android 호환성
```

이 가이드를 따라 안전하고 효율적인 배포를 진행하세요!
