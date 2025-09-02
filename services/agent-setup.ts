import {Agent} from '@credo-ts/core';
import DIDService from './did/did-service';

/**
 * 에이전트 초기화 함수
 * @param accountId 계정 ID
 * @returns 초기화된 Agent 인스턴스
 */
export const initializeAgent = async (accountId: string): Promise<Agent> => {
  try {
    console.log('🚀 Agent 전역 초기화 시작...', {accountId});

    // DIDService를 통해 Agent 초기화
    const agent = await DIDService.ensureAgentInitialized(accountId);

    if (!agent) {
      throw new Error('Agent 초기화에 실패했습니다.');
    }

    console.log('✅ Agent 전역 초기화 완료');
    return agent;
  } catch (error) {
    console.error('❌ Agent 초기화 실패:', error);
    throw error;
  }
};

/**
 * Agent 상태 확인 함수
 */
export const getAgentStatus = () => {
  return DIDService.getAgentStatus();
};

/**
 * Agent 준비 상태 확인 함수
 */
export const isAgentReady = () => {
  return DIDService.isAgentReady();
};

/**
 * Agent 리셋 함수 (로그아웃 시 사용)
 */
export const resetAgent = () => {
  DIDService.resetAgent();
};
