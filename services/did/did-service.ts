import {Agent} from '@credo-ts/core';
import {
  initAgent,
  generateBatchConnections,
  getBatchInvitations,
  sendAgentPublicDidToUser,
} from './credo';
import {getInvitationUrls} from '../apis/did';

/**
 * DID 서비스 클래스
 * Credo 에이전트와 연결 관리를 담당
 */
class DIDService {
  private agent: Agent | null = null;
  private userConnectionId: string | null = null;
  private mediatorConnectionId: string | null = null;
  private didPublicKey: string | null = null;

  /**
   * 에이전트 초기화
   * @param accountId 계정 ID
   * @param walletId 지갑 ID
   * @param walletKey 지갑 키
   */
  async initializeAgent(
    accountId: string,
    walletId?: string,
    walletKey?: string,
  ) {
    try {
      console.log('DID 에이전트 초기화 시작...');
      this.agent = await initAgent(accountId);
      console.log('DID 에이전트 초기화 완료');
      return this.agent;
    } catch (error) {
      console.error('DID 에이전트 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * DID 초대 URL 가져오기
   * @param accessToken 액세스 토큰
   * @returns 초대 URL 객체
   */
  async getInvitationUrls(accessToken: string) {
    try {
      const response = await getInvitationUrls(accessToken);
      return {
        mediatorInvitationUrl: response.mediatorInvitationUrl,
        userAcaPyInvitationUrl: response.userAcaPyInvitationUrl,
      };
    } catch (error) {
      console.error('DID 초대 URL 가져오기 실패:', error);
      throw error;
    }
  }

  /**
   * DID 서비스에 연결
   * @param mediatorUrl 미디에이터 URL
   * @param userUrl 사용자 URL
   */
  async connectToDIDServices(mediatorUrl: string, userUrl: string) {
    try {
      if (!this.agent) {
        throw new Error('에이전트가 초기화되지 않았습니다.');
      }

      console.log('DID 서비스 연결 시작...');
      const result = await generateBatchConnections(this.agent, {
        mediator: mediatorUrl,
        user: userUrl,
      });

      if (result.userConnection) {
        this.userConnectionId = result.userConnection.id;
        console.log('User 연결 ID 저장:', this.userConnectionId);
      }

      if (result.mediatorConnection) {
        this.mediatorConnectionId = result.mediatorConnection.id;
        console.log('Mediator 연결 ID 저장:', this.mediatorConnectionId);
      }

      // 연결이 성공하면 agent의 public DID를 user-acy-py에게 전송
      if (this.userConnectionId) {
        await this.sendPublicDid();
      }

      return result;
    } catch (error) {
      console.error('DID 서비스 연결 실패:', error);
      throw error;
    }
  }

  /**
   * Agent의 public DID를 user-acy-py에게 전송
   */
  async sendPublicDid() {
    try {
      if (!this.agent) {
        throw new Error('에이전트가 초기화되지 않았습니다.');
      }

      if (!this.userConnectionId) {
        throw new Error('User 연결이 설정되지 않았습니다.');
      }

      console.log('Agent의 public DID를 user-acy-py에게 전송 시작...');
      const didInfo = await sendAgentPublicDidToUser(
        this.agent,
        this.userConnectionId,
      );

      if (didInfo && didInfo.did) {
        this.didPublicKey = didInfo.did;
        console.log('DID 공개키 저장:', this.didPublicKey);
      }

      return didInfo;
    } catch (error) {
      console.error('Agent DID 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 저장된 DID 공개키 가져오기
   */
  getDidPublicKey() {
    return this.didPublicKey;
  }

  /**
   * 에이전트 가져오기
   */
  getAgent() {
    return this.agent;
  }

  /**
   * 연결 ID 가져오기
   */
  getConnectionIds() {
    return {
      userConnectionId: this.userConnectionId,
      mediatorConnectionId: this.mediatorConnectionId,
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new DIDService();
