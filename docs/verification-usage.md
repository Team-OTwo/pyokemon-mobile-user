# Verification 시스템 사용법

## 개요

Verification 시스템은 최초 로그인과 등록된 디바이스가 다른 경우의 본인 인증을 처리합니다.

## 주요 기능

1. **동적 메시지 시스템**: 상황에 맞는 메시지 자동 표시
2. **유연한 인증 요청 방식**: SMS, 음성, 이메일 인증 지원
3. **기기 등록 방식 선택**: 디바이스 불일치 시 수락/거절 선택

## 사용법

### 1. 기본 사용법 (기존 호환성 유지)

```typescript
// 기존 방식 - message 필드 사용
navigation.navigate('Verification', {
  message:
    '최초 로그인이시군요!\n회원님의 기기등록을 위해\n본인 인증을 진행해주세요',
  deviceId: 'device123',
  fcmToken: 'fcm_token_here',
  osType: 'ios',
  accessToken: 'access_token_here',
  refreshToken: 'refresh_token_here',
});
```

### 2. 새로운 방식 - messageType 사용

```typescript
// 최초 로그인
navigation.navigate('Verification', {
  messageType: 'FIRST_LOGIN',
  deviceId: 'device123',
  fcmToken: 'fcm_token_here',
  osType: 'ios',
  accessToken: 'access_token_here',
  refreshToken: 'refresh_token_here',
});

// 등록된 디바이스가 다른 경우
navigation.navigate('Verification', {
  messageType: 'DIFFERENT_DEVICE',
  deviceId: 'device123',
  fcmToken: 'fcm_token_here',
  osType: 'ios',
  accessToken: 'access_token_here',
  refreshToken: 'refresh_token_here',
});
```

### 3. 인증 요청 방식 지정

```typescript
// SMS 인증 (기본값)
navigation.navigate('Verification', {
  messageType: 'FIRST_LOGIN',
  requestType: 'SMS',
  // ... 기타 필드
});

// 음성 인증
navigation.navigate('Verification', {
  messageType: 'FIRST_LOGIN',
  requestType: 'CALL',
  // ... 기타 필드
});

// 이메일 인증
navigation.navigate('Verification', {
  messageType: 'FIRST_LOGIN',
  requestType: 'EMAIL',
  // ... 기타 필드
});
```

### 4. 기기 등록 방식 선택 (디바이스 불일치 시)

```typescript
// 디바이스 불일치 시 자동으로 기기 등록 확인 UI가 표시됩니다
navigation.navigate('Verification', {
  messageType: 'DIFFERENT_DEVICE',
  deviceId: 'device123',
  fcmToken: 'fcm_token_here',
  osType: 'ios',
  accessToken: 'access_token_here',
  refreshToken: 'refresh_token_here',
});
```

## 지원하는 메시지 타입

### FIRST_LOGIN

- 메시지: "최초 로그인이시군요!\n회원님의 기기등록을 위해\n본인 인증을 진행해주세요"

### DIFFERENT_DEVICE

- 메시지: "등록된 디바이스가 다릅니다\n기존 기기 등록을 해제하고\n새로운 기기로 등록해주세요"
- **추가 기능**: 기기 등록 확인 UI 자동 표시

## 지원하는 인증 요청 방식

### SMS (기본값)

- 아이콘: sms
- 버튼 텍스트: "인증번호 발송"
- 설명: "발송된 인증번호를\n입력해주세요"

<!-- ### CALL

- 아이콘: phone
- 버튼 텍스트: "음성 인증 시작"
- 설명: "전화로 발송된 인증번호를\n입력해주세요"

### EMAIL

- 아이콘: email
- 버튼 텍스트: "이메일 인증번호 발송"
- 설명: "이메일로 발송된 인증번호를\n입력해주세요" -->

## 기기 등록 방식 선택

### REMOVE_OLD_AND_REGISTER_NEW (기존 기기 등록 해제 후 새로 등록)

- 설명: "기존 기기 등록을 해제하고 새로운 기기로 등록합니다"
- 사용 시나리오: 기기를 교체했거나 보안상 기존 기기 등록을 해제하고 싶은 경우

**중요**: 디바이스 불일치 시에는 이 옵션만 가능하며, 거절하면 로그인할 수 없습니다.

## 사용자 경험 플로우

### 최초 로그인

1. 로그인 성공 → `messageType: 'FIRST_LOGIN'` 전달
2. Verification 페이지 첫 단계에서 안내 메시지 표시
3. 본인인증 시작 → 휴대폰 인증 → 인증번호 확인 → 완료

### 디바이스 불일치

1. 로그인 성공 → `messageType: 'DIFFERENT_DEVICE'` 전달
2. Verification 페이지 첫 단계에서 **기기 등록 확인 UI** 표시
3. 사용자가 선택:
   - **수락**: 기존 기기 등록 해제 후 새로운 기기로 등록 진행
   - **거절**: 로그인 실패, 로그인 페이지로 돌아가기
4. 수락 시 → 휴대폰 인증 → 인증번호 확인 → 완료

## 보안 정책

### 디바이스 불일치 시 강제 정책

- **수락**: 본인인증을 통한 기기 등록 진행
- **거절**: 로그인 불가, 로그인 페이지로 강제 이동
- **목적**: 보안을 위해 사용자가 명시적으로 동의한 경우에만 기기 등록 허용

## 장점

1. **보안성**: 디바이스 불일치 시 사용자 동의 없이는 기기 등록 불가
2. **유연성**: 메시지와 인증 방식을 동적으로 변경 가능
3. **사용자 선택권**: 디바이스 불일치 시 명확한 수락/거절 선택
4. **호환성**: 기존 코드와 완벽 호환
5. **가독성**: 명확한 타입 정의와 상수 사용
6. **유지보수성**: 중앙화된 설정 관리
7. **확장성**: 새로운 메시지 타입과 인증 방식 쉽게 추가 가능

## 코드 구조

```
screens/verification/
├── types.ts          # 타입 정의 (MessageType, RequestType, DeviceAction)
├── constants.ts      # 상수 및 설정 (동적 메시지, 요청 설정)
├── verification-page.tsx  # 메인 컴포넌트 (기기 등록 확인 UI 포함)
└── _components/      # 하위 컴포넌트들
```

## 구현 예시

### 로그인 페이지에서 사용

```typescript
// screens/login/login-page.tsx
if (response.deviceStatus === 'NOT_REGISTERED') {
  navigation.navigate('Verification', {
    messageType: 'FIRST_LOGIN',
    deviceId: device_number,
    fcmToken,
    osType,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
} else if (response.deviceStatus === 'MISMATCHED') {
  navigation.navigate('Verification', {
    messageType: 'DIFFERENT_DEVICE',
    deviceId: device_number,
    fcmToken,
    osType,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
}
```

## UI 구성

### 기기 등록 확인 화면

- **제목**: "기기 등록 확인"
- **설명**: "등록된 디바이스가 다릅니다. 기존 기기 등록을 해제하고 새로운 기기로 등록하시겠습니까?"
- **버튼**:
  - **거절** (빨간색): "로그인할 수 없습니다"
  - **수락** (초록색): "본인인증 진행"

이제 디바이스 불일치 시 사용자가 명확하게 수락/거절을 선택할 수 있고, 거절 시에는 로그인할 수 없는 보안 정책이 적용됩니다!
