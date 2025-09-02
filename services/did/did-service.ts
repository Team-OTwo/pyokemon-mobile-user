import {Agent} from '@credo-ts/core';
import {pollMediatorForCredentials} from './credo';

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
   * VC 폴링을 위한 도우미 메서드
   * AgentProvider에서 관리하는 agent와 연결 정보를 사용
   */

  /**
   * Mediator ACA-Py에서 VC 폴링 (AgentProvider에서 관리하는 agent 사용)
   * @param agent AgentProvider에서 관리하는 agent
   * @param maxAttempts 최대 시도 횟수
   * @param intervalMs 폴링 간격 (밀리초)
   */
  async pollForCredentials(
    agent: Agent,
    maxAttempts: number = 10,
    intervalMs: number = 2000,
  ) {
    try {
      console.log('🔍 VC 폴링 시작 - AgentProvider에서 관리하는 Agent 사용');
      console.log('- Agent 초기화:', agent ? '✅' : '❌');

      if (!agent) {
        throw new Error('Agent가 제공되지 않았습니다.');
      }

      console.log('Mediator ACA-Py에서 VC 폴링 시작...');
      const result = await pollMediatorForCredentials(
        agent,
        maxAttempts,
        intervalMs,
      );

      // 결과 처리
      if (result.success && result.credentials) {
        console.log('✅ VC 폴링 성공!');
        console.log('수신된 VC:', {
          id: result.credentials.id,
          state: result.credentials.state,
          threadId: result.credentials.threadId,
        });
      } else {
        console.log('⚠️ VC 폴링 실패 또는 VC 없음');
        console.log('실패 이유:', result.message);
      }

      return result;
    } catch (error) {
      console.error('VC 폴링 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default DIDService.getInstance();
