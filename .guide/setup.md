# 프로젝트 설정 가이드

Pyokemon 프로젝트의 개발 환경 설정 가이드입니다. 이 문서는 개발 환경 설정, 프로젝트 구조, 개발 시 주의사항 등을 설명합니다.

## 개발 환경 설정

### 필수 요구사항

- Node.js 18.x 이상
- npm 9.x 이상 또는 yarn 1.22.x 이상
- Git
- Expo CLI

### 개발 환경 설정 단계

1. **Node.js 설치**

   [Node.js 공식 웹사이트](https://nodejs.org/)에서 LTS 버전을 다운로드하여 설치합니다.

2. **Expo CLI 설치**

   ```bash
   npm install -g expo-cli
   # 또는
   yarn global add expo-cli
   ```

3. **프로젝트 클론**

   ```bash
   git clone https://github.com/your-username/pyokemon.git
   cd pyokemon
   ```

4. **의존성 설치**

   ```bash
   npm install
   # 또는
   yarn install
   ```

5. **개발 서버 실행**

   ```bash
   npm start
   # 또는
   yarn start
   ```

## iOS 개발 환경 설정

### 요구사항

- macOS
- Xcode 14 이상
- iOS 시뮬레이터 또는 실제 iOS 기기

### 설정 단계

1. **Xcode 설치**

   App Store에서 Xcode를 설치합니다.

2. **iOS 시뮬레이터 설정**

   Xcode를 실행하고 `Preferences > Components`에서 필요한 iOS 시뮬레이터를 설치합니다.

3. **iOS 앱 실행**

   ```bash
   npm run ios
   # 또는
   yarn ios
   ```

## Android 개발 환경 설정

### 요구사항

- Android Studio
- Android SDK
- Android 에뮬레이터 또는 실제 Android 기기

### 설정 단계

1. **Android Studio 설치**

   [Android Studio 공식 웹사이트](https://developer.android.com/studio)에서 다운로드하여 설치합니다.

2. **Android SDK 설치**

   Android Studio를 실행하고 `Tools > SDK Manager`에서 필요한 SDK를 설치합니다.

3. **환경 변수 설정**

   `ANDROID_HOME` 환경 변수를 설정합니다.

   **macOS/Linux**:

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

   **Windows**:

   ```
   set ANDROID_HOME=C:\Users\USERNAME\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
   ```

4. **Android 에뮬레이터 설정**

   Android Studio의 AVD Manager에서 새 가상 기기를 생성합니다.

5. **Android 앱 실행**

   ```bash
   npm run android
   # 또는
   yarn android
   ```

## 실제 기기에서 테스트

### iOS 기기

1. Apple 개발자 계정이 필요합니다.
2. Xcode에서 프로젝트를 열고 Signing & Capabilities 설정을 구성합니다.
3. 기기를 연결하고 실행합니다.

### Android 기기

1. 기기에서 개발자 옵션과 USB 디버깅을 활성화합니다.
2. USB로 기기를 연결합니다.
3. `adb devices` 명령으로 기기가 인식되는지 확인합니다.
4. `npm run android` 또는 `yarn android`로 앱을 실행합니다.

### Expo Go 앱 사용

1. 기기에 Expo Go 앱을 설치합니다.
2. 개발 서버를 실행합니다: `npm start` 또는 `yarn start`
3. QR 코드를 스캔하거나 개발 URL을 입력하여 앱을 실행합니다.

## 환경 변수 설정

1. 프로젝트 루트에 `.env` 파일을 생성합니다.
2. 필요한 환경 변수를 추가합니다:

   ```
   API_URL=https://api.example.com
   API_KEY=your_api_key
   ```

3. 환경 변수를 사용하려면 `react-native-dotenv` 패키지를 설치합니다:

   ```bash
   npm install react-native-dotenv
   # 또는
   yarn add react-native-dotenv
   ```

4. `babel.config.js` 파일에 플러그인을 추가합니다:

   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ["babel-preset-expo"],
       plugins: [
         [
           "module:react-native-dotenv",
           {
             moduleName: "@env",
             path: ".env",
             blacklist: null,
             whitelist: null,
             safe: false,
             allowUndefined: true,
           },
         ],
       ],
     };
   };
   ```

5. 코드에서 환경 변수를 임포트하여 사용합니다:

   ```javascript
   import { API_URL, API_KEY } from "@env";
   ```

## 유용한 개발 도구

### React Native Debugger

1. [React Native Debugger](https://github.com/jhen0409/react-native-debugger) 설치:

   ```bash
   # macOS
   brew install --cask react-native-debugger

   # Windows/Linux
   # GitHub 릴리스 페이지에서 다운로드
   ```

2. 앱에서 디버깅 모드를 활성화하고 React Native Debugger를 실행합니다.

### Flipper

1. [Flipper](https://fbflipper.com/) 설치
2. 앱을 실행하고 Flipper를 연결합니다.

## 문제 해결

### 일반적인 오류

1. **Metro 서버 연결 오류**

   ```bash
   # Metro 서버 캐시 삭제
   npm start -- --reset-cache
   # 또는
   yarn start --reset-cache
   ```

2. **의존성 오류**

   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules
   npm install
   # 또는
   yarn install
   ```

3. **iOS 빌드 오류**

   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   # 또는
   yarn ios
   ```

4. **Android 빌드 오류**

   ```bash
   # gradlew 캐시 삭제
   cd android
   ./gradlew clean
   cd ..
   npm run android
   # 또는
   yarn android
   ```

### 프로젝트 리셋

프로젝트에 심각한 문제가 발생한 경우, 다음 명령으로 프로젝트를 리셋할 수 있습니다:

```bash
npm run reset-project
# 또는
yarn reset-project
```

이 명령은 캐시, 빌드 파일, node_modules를 삭제하고 의존성을 다시 설치합니다.
