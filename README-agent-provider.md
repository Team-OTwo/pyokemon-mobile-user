# Agent Provider 사용 가이드

## 🎯 개요

Agent Provider는 Credo Agent를 전역적으로 관리하는 React Context입니다. 모든 Agent 관련 로직을 중앙에서 관리하여 복잡성을 줄이고 일관성을 보장합니다.

## 🚀 주요 기능

### 1. 전역 Agent 관리

- **최초 사용자**: 로그인 페이지에서 `initializeAgentForNewUser()` 호출 → Agent 생성 및 연결 설정 → 전역 등록
- **기존 사용자**: AgentProvider에서 자동으로 기존 지갑 정보로 Agent 복원

### 2. 단순화된 구조

- **AgentProvider**: 모든 Agent 관련 로직 중앙 관리
- **DIDService**: VC 폴링 등 도우미 기능만 제공
- **useWallet**: 지갑 정보 관리만 담당 (Agent 로직 제거)

## 📝 사용 방법

### 기본 사용법

```typescript
import {
  useAgent,
  useAgentStatus,
  useSetExternalAgent,
} from '../contexts/agent-provider';

const MyComponent = () => {
  const agent = useAgent();
  const {isInitialized} = useAgentStatus();

  const handleAction = async () => {
    if (isInitialized) {
      // Agent 작업 수행
      const connections = await agent.connections.getAll();
      console.log('연결 목록:', connections);
    }
  };

  return (
    <View>
      <Text>Agent 상태: {isInitialized ? '초기화됨' : '초기화되지 않음'}</Text>
      <Button title="Agent 작업" onPress={handleAction} />
    </View>
  );
};
```

### 새 사용자 Agent 초기화 (로그인 페이지에서 사용)

```typescript
import {useInitializeAgentForNewUser} from '../contexts/agent-provider';

const LoginPage = () => {
  const initializeAgentForNewUser = useInitializeAgentForNewUser();

  const handleLogin = async () => {
    // 새 사용자인 경우 Agent 초기화
    if (!savedWalletInfo || !savedWalletInfo.createdAt) {
      await initializeAgentForNewUser(accountId, accessToken);
      console.log('✅ 새 사용자 Agent 초기화 완료');
    }
  };
};
```

### 실제 사용 예시 (ticket-detail-page.tsx)

```typescript
export default function TicketDetail() {
  const agent = useAgent(); // null일 수도 있음 (로딩 중이거나 초기화되지 않은 상태)
  const {isInitialized} = useAgentStatus();

  const handleGetCredential = async () => {
    // Agent 상태 확인
    if (!isInitialized || !agent) {
      Alert.alert('Agent 초기화 필요', 'DID Agent가 초기화되지 않았습니다.');
      return;
    }

    // Agent 작업 수행
    const DIDService = await import('../../services/did/did-service');
    const pollingResult = await DIDService.default.pollForCredentials(
      15,
      2000,
      user,
    );
  };

  return (
    <View>
      {!isInitialized ? (
        <AuthButton title="Agent 초기화 필요" disabled={true} />
      ) : (
        <AuthButton title="VC 요청" onPress={handleGetCredential} />
      )}
    </View>
  );
}
```

### 에러 처리

#### useAgent 훅 사용 시 주의사항:

- `useAgent()`는 AgentProvider 안에서만 사용 가능
- agent는 `null`일 수 있음 (로딩 중이거나 초기화되지 않은 상태)
- agent 사용 전에 반드시 null 체크 필요

#### 안전한 사용법:

```typescript
const agent = useAgent(); // null일 수도 있음
const {isInitialized} = useAgentStatus();

// 안전한 사용
if (isInitialized && agent) {
  // agent 사용
  const connections = await agent.connections.getAll();
}
```

### 조건부 렌더링

```typescript
const ConditionalComponent = () => {
  const {isInitialized} = useAgentStatus();

  if (!isInitialized) {
    return <Text>Agent가 초기화되지 않았습니다.</Text>;
  }

  return <AgentComponent />;
};
```

## 🔄 동작 흐름

### 1. 앱 시작

```
AuthProvider → 사용자 상태 확인
```

### 2. 로그인 처리

```
로그인 페이지 → 지갑 정보 확인
├─ 최초 사용자 → invitation 요청 → 지갑 생성 → 연결 설정 → DIDService와 AgentProvider 전역 등록
└─ 기존 사용자 → AgentProvider에서 자동 관리

AgentProvider → 기존 지갑 확인
├─ 기존 지갑 + 연결 정보 있음 → DIDService에서 기존 Agent 가져오기
├─ 기존 지갑 + 연결 정보 없음 → 새로 Agent 초기화
└─ 새 사용자 → 로그인 페이지에서 처리됨
```

### 3. Agent 초기화

```
DIDService → Agent 초기화
├─ 저장된 지갑 정보 사용
├─ 연결 정보 복원
└─ Agent 상태 설정
```

### 4. 전역 사용

```
모든 컴포넌트 → useAgent() 로 Agent 접근
```

## 🛡️ 기존 지갑 보호 로직

### DIDService.getInvitationUrls()

```typescript
// 기존 지갑이 있으면 invitation 요청 건너뛰기
if (savedWalletInfo && savedWalletInfo.createdAt) {
  console.log('✅ 기존 지갑 정보가 있으므로 초대 URL 요청을 건너뜁니다.');
  return {mediatorInvitationUrl: '', userAcaPyInvitationUrl: ''};
}
```

### Agent 초기화 시

```typescript
// 저장된 연결 정보 복원
await this.restoreConnectionInfo();

if (this.mediatorConnectionId && this.userConnectionId) {
  console.log('✅ 기존 사용자 - 연결 정보 복원 성공');
}
```

## 📊 로그 예시

### 최초 사용자 로그인

```
로그인 성공 후 최초 지갑 생성 확인...
🆕 최초 사용자 - Agent 초기화 시작...
🆕 새 사용자 Agent 초기화 시작...
초대 URL 요청 중...
agent초기화 시작
agent초기화 완료
User ACA-Py를 먼저 연결하고, 그 다음 Mediator ACA-Py 연결 시작...
🎉 두 ACA-Py 모두 성공적으로 연결되었습니다
✅ 연결 정보를 지갑 정보에 저장 완료
✅ 새 사용자 Agent 초기화 완료
✅ 최초 사용자 Agent 초기화 완료
```

### 기존 사용자 로그인

```
로그인 성공 후 최초 지갑 생성 확인...
✅ 기존 사용자 - AgentProvider에서 자동으로 Agent 관리됩니다.

AgentProvider에서 Agent 관리 시작...
🔍 사용자 로그인 감지, Agent 상태 확인... {"user": "user123"}
✅ 기존 지갑 발견: {"walletId": "wallet-user123-1234567890", "createdAt": "2024-01-01T00:00:00.000Z", "hasConnections": true}
✅ 기존 연결 정보 있음, Agent 초기화
✅ 기존 사용자 Agent 복원 완료
```

## 🔧 설정 파일

### App.tsx

```typescript
function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <AgentProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </AgentProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

## 🎯 장점

1. **자동 관리**: 사용자 상태에 따라 자동으로 Agent 초기화/정리
2. **기존 지갑 보호**: 기존 지갑이 있으면 불필요한 invitation 요청 방지
3. **전역 접근**: 모든 컴포넌트에서 쉽게 Agent 사용
4. **상태 관리**: Agent 초기화 상태를 실시간으로 확인 가능
5. **에러 처리**: 초기화 실패 시 적절한 에러 처리
