import {Agent} from '@credo-ts/core';
import {
  syncCredentialsFromMediator,
  syncCredentialsFromMediator1,
} from './credo';

/**
 * DID 서비스 클래스 (단순화된 도우미 클래스)
 * AgentProvider에서 전역 관리하므로 여기서는 VC 폴링 등 도우미 기능만 제공
 */
class DIDService {
  private static instance: DIDService;

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): DIDService {
    if (!DIDService.instance) {
      DIDService.instance = new DIDService();
    }
    return DIDService.instance;
  }

  /**
   * Mediator ACA-Py에서 VC 폴링 (AgentProvider에서 관리하는 agent 사용)
   * @param agent AgentProvider에서 관리하는 agent
   * @param maxAttempts 최대 시도 횟수
   * @param intervalMs 폴링 간격 (밀리초)
   */
  async pollForCredentials(agent: Agent) {
    try {
      if (!agent) {
        throw new Error('Agent가 제공되지 않았습니다.');
      }

      // const result = await syncCredentialsFromMediator(agent);
      await syncCredentialsFromMediator1(agent);
    } catch (error) {
      console.error('VC 폴링 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default DIDService.getInstance();
