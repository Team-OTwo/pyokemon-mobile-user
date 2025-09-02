import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {Agent} from '@credo-ts/core';
import {initAgent, setupConnectionEventListeners} from '../services/did/credo';
import {getInvitationUrls} from '../services/apis/did';
import {
  generateBatchConnections,
  sendAgentPublicDidToUser,
} from '../services/did/credo';
import {
  getWalletInfo,
  saveWalletInfo,
  updateDidPublicKey,
} from '../services/storage/walletStorage';
import useAuth from '../hooks/useAuth';

// 1. Context 타입 정의
type AgentContextType = {
  agent: Agent | null;
  isInitialized: boolean;
  userConnectionId: string | null;
  mediatorConnectionId: string | null;
  didPublicKey: string | null;
  setExternalAgent: (agent: Agent) => void;
  initializeAgentForNewUser: (
    accountId: string,
    accessToken: string,
  ) => Promise<void>;
};

// 2. Context 생성 (초기값은 null)
const AgentContext = createContext<AgentContextType>({
  agent: null,
  isInitialized: false,
  userConnectionId: null,
  mediatorConnectionId: null,
  didPublicKey: null,
  setExternalAgent: () => {},
  initializeAgentForNewUser: async () => {},
});

// 3. Provider 컴포넌트 생성
interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({children}) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userConnectionId, setUserConnectionId] = useState<string | null>(null);
  const [mediatorConnectionId, setMediatorConnectionId] = useState<
    string | null
  >(null);
  const [didPublicKey, setDidPublicKey] = useState<string | null>(null);
  const {user} = useAuth();

  // 외부에서 agent를 설정할 수 있는 함수
  const setExternalAgent = (externalAgent: Agent) => {
    console.log('🔧 외부에서 생성된 Agent를 AgentProvider에 설정');
    setAgent(externalAgent);
    setIsInitialized(true);
  };

  // 새 사용자를 위한 agent 초기화 함수
  const initializeAgentForNewUser = async (
    accountId: string,
    accessToken: string,
  ) => {
    try {
      console.log('🆕 새 사용자 Agent 초기화 시작...');

      // 1. 초대 URL 요청
      console.log('초대 URL 요청 중...');
      const invitationResponse = await getInvitationUrls(accessToken);
      console.log('invitationResponse', invitationResponse);

      // 응답 데이터 검증
      if (!invitationResponse?.data) {
        throw new Error('초대 URL 응답 데이터가 없습니다');
      }

      if (
        !invitationResponse.data.mediator_acapy_invi_url ||
        !invitationResponse.data.user_acapy_invi_url
      ) {
        throw new Error(
          '필수 초대 URL이 누락되었습니다 (Mediator: 8010, User: 8020)',
        );
      }

      // 2. Agent 초기화
      console.log('agent초기화 시작');
      const newAgent = await initAgent(accountId);
      console.log('agent초기화 완료');

      // 연결 상태 변경 이벤트 리스너 설정
      setupConnectionEventListeners(newAgent);

      // 3. 연결 생성
      const invitationUrls = {
        mediator: invitationResponse.data.user_acapy_invi_url,
        user: invitationResponse.data.mediator_acapy_invi_url,
      };

      console.log('변환된 초대 URL:', invitationUrls);
      console.log(
        'User ACA-Py를 먼저 연결하고, 그 다음 Mediator ACA-Py 연결 시작...',
      );

      const {allConnections, allSuccess} = await generateBatchConnections(
        newAgent,
        invitationUrls,
      );

      if (allSuccess) {
        console.log('🎉 두 ACA-Py 모두 성공적으로 연결되었습니다');
      } else {
        console.log(
          '⚠️ 일부 ACA-Py 연결에 실패했습니다. 부분적으로 작동할 수 있습니다.',
        );
      }

      // 4. DID 전송 및 연결 정보 저장
      if (allConnections.length >= 2) {
        const didResult = await sendAgentPublicDidToUser(
          newAgent,
          allConnections[0].id,
        );

        // DID 공개키 저장
        if (didResult.did) {
          setDidPublicKey(didResult.did);
          await updateDidPublicKey(didResult.did);
          console.log('✅ DID 공개키 저장 완료:', didResult.did);
        }

        // 연결 정보 저장
        setUserConnectionId(allConnections[0].id);
        setMediatorConnectionId(allConnections[1].id);

        // 지갑 정보에 연결 정보 저장
        const savedWalletInfo = await getWalletInfo();
        if (savedWalletInfo) {
          const updatedWalletInfo = {
            ...savedWalletInfo,
            userConnectionId: allConnections[0].id,
            mediatorConnectionId: allConnections[1].id,
            didPublicKey: didResult.did,
            savedAt: new Date().toISOString(),
          };
          await saveWalletInfo(updatedWalletInfo);
          console.log('✅ 연결 정보를 지갑 정보에 저장 완료');
        }
      }

      // 5. Agent 설정
      setAgent(newAgent);
      setIsInitialized(true);
      console.log('✅ 새 사용자 Agent 초기화 완료');
    } catch (error) {
      console.error('❌ 새 사용자 Agent 초기화 실패:', error);
      throw error;
    }
  };

  useEffect(() => {
    const setupAgent = async () => {
      try {
        if (user) {
          console.log('🔍 사용자 로그인 감지, Agent 상태 확인...', {user});

          // 기존 지갑 정보 확인
          const savedWalletInfo = await getWalletInfo();

          if (savedWalletInfo && savedWalletInfo.createdAt) {
            const hasConnections = !!(
              savedWalletInfo.userConnectionId ||
              savedWalletInfo.mediatorConnectionId
            );

            console.log('✅ 기존 지갑 발견:', {
              walletId: savedWalletInfo.walletId,
              createdAt: savedWalletInfo.createdAt,
              hasConnections,
            });

            if (hasConnections) {
              console.log('✅ 기존 연결 정보 있음, Agent 초기화');

              // 기존 지갑으로 Agent 초기화
              const existingAgent = await initAgent(
                user,
                savedWalletInfo.walletId,
                savedWalletInfo.walletKey,
              );

              // 연결 정보 복원
              setUserConnectionId(savedWalletInfo.userConnectionId || null);
              setMediatorConnectionId(
                savedWalletInfo.mediatorConnectionId || null,
              );
              setDidPublicKey(savedWalletInfo.didPublicKey || null);
              setAgent(existingAgent);
              setIsInitialized(true);

              console.log('✅ 기존 사용자 Agent 복원 완료');
            } else {
              console.log('⚠️ 기존 지갑은 있지만 연결 정보 없음, 새로 초기화');
              const existingAgent = await initAgent(
                user,
                savedWalletInfo.walletId,
                savedWalletInfo.walletKey,
              );
              setAgent(existingAgent);
              setIsInitialized(true);
            }
          } else {
            console.log(
              '🆕 새 사용자 또는 지갑 없음, 로그인 페이지에서 처리됨',
            );
            // 새 사용자는 로그인 페이지에서 처리되므로 AgentProvider에서는 대기
            setAgent(null);
            setIsInitialized(false);
          }
        } else {
          console.log('👤 사용자가 로그인되지 않음, Agent 초기화 건너뜀');
          setAgent(null);
          setIsInitialized(false);
        }
      } catch (error) {
        console.error('❌ 에이전트 초기화 실패:', error);
        setAgent(null);
        setIsInitialized(false);
      }
    };

    setupAgent();
  }, [user]);

  return (
    <AgentContext.Provider
      value={{
        agent,
        isInitialized,
        userConnectionId,
        mediatorConnectionId,
        didPublicKey,
        setExternalAgent,
        initializeAgentForNewUser,
      }}>
      {children}
    </AgentContext.Provider>
  );
};

// 4. Context를 쉽게 사용하기 위한 Custom Hook 생성
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent는 반드시 AgentProvider 안에서 사용해야 합니다.');
  }
  return context.agent; // null일 수도 있음 (로딩 중이거나 초기화되지 않은 상태)
};

// 5. Agent 상태 정보를 가져오는 Hook
export const useAgentStatus = () => {
  const context = useContext(AgentContext);
  return {
    isInitialized: context.isInitialized,
    agent: context.agent,
    userConnectionId: context.userConnectionId,
    mediatorConnectionId: context.mediatorConnectionId,
    didPublicKey: context.didPublicKey,
  };
};

// 6. 외부에서 agent를 설정할 수 있는 Hook
export const useSetExternalAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error(
      'useSetExternalAgent는 반드시 AgentProvider 안에서 사용해야 합니다.',
    );
  }
  return context.setExternalAgent;
};

// 7. 새 사용자 Agent 초기화 Hook
export const useInitializeAgentForNewUser = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error(
      'useInitializeAgentForNewUser는 반드시 AgentProvider 안에서 사용해야 합니다.',
    );
  }
  return context.initializeAgentForNewUser;
};
