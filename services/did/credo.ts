import {
  Agent,
  AgentEventTypes,
  BasicMessagesModule,
  ConnectionEventTypes,
  ConnectionRecord,
  ConnectionsModule,
  ConnectionStateChangedEvent,
  DidsModule,
  HttpOutboundTransport,
  InitConfig,
  OutOfBandModule,
  DidCommMimeType,
  MediationRecipientModule,
  MediationRecord,
  CredentialsModule,
  CredentialState,
  AutoAcceptCredential,
} from '@credo-ts/core';
import {AskarModule} from '@credo-ts/askar';
import {agentDependencies} from '@credo-ts/react-native';
import {ariesAskar} from '@hyperledger/aries-askar-react-native';
import {getInvitationUrls} from '../apis/did';
import {getWalletInfo, saveWalletInfo} from '../storage/walletStorage';

// 여러 개의 초대 URL을 한번에 요청하는 함수
export const getBatchInvitations = async (
  accessToken: string,
  count: number,
) => {
  try {
    const invitationUrls = await getInvitationUrls(accessToken);
    return invitationUrls;
    // return invitationsWithUrl;
  } catch (error) {
    console.error('배치 초대 요청 실패:', error);
    throw error;
  }
};

// 전역 에이전트 변수 선언
let agent: Agent;

export const initAgent = async (
  accountId: string,
  walletId?: string,
  walletKey?: string,
) => {
  try {
    // 저장된 지갑 정보가 있으면 사용, 없으면 새로 생성
    let finalWalletId = walletId || `wallet-${accountId}`;
    let finalWalletKey = walletKey || `key-${accountId}`;

    console.log('지갑 설정:', {accountId, finalWalletId, finalWalletKey});

    const walletInfo = await getWalletInfo();
    if (walletInfo) {
      finalWalletId = walletInfo.walletId;
      finalWalletKey = walletInfo.walletKey;
    }

    // 지갑 ID와 키 유효성 검사
    if (!finalWalletId || finalWalletId.includes('}')) {
      throw new Error(`잘못된 지갑 ID 형식: ${finalWalletId}`);
    }
    if (!finalWalletKey || finalWalletKey.includes('}')) {
      throw new Error(`잘못된 지갑 키 형식: ${finalWalletKey}`);
    }

    // Credo 공식 문서에 따른 InitConfig 설정
    const config: InitConfig = {
      label: `${accountId}-agent`,
      walletConfig: {
        id: finalWalletId,
        key: finalWalletKey,
      },
      autoUpdateStorageOnStartup: true,
      // 두 ACA-Py 모두 연결할 수 있도록 엔드포인트 설정
      // DIDComm 메시지 타입 설정 (ACA-Py와 호환성 보장)
      didCommMimeType: DidCommMimeType.V0,
      // 자동 수락 설정은 ConnectionsModule에서 설정
    };

    // Credo 공식 문서에 따른 Agent 설정
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        connections: new ConnectionsModule({
          autoAcceptConnections: true,
        }),
        outOfBand: new OutOfBandModule(),
        dids: new DidsModule(),
        aries: new AskarModule({ariesAskar}),
        mediationRecipient: new MediationRecipientModule(),
        basicMessages: new BasicMessagesModule(),
        credentials: new CredentialsModule({
          autoAcceptCredentials: AutoAcceptCredential.Always,
        }),
      },
    });

    if (!walletInfo) {
      await saveWalletInfo({
        walletId: finalWalletId,
        walletKey: finalWalletKey,
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        migrated: false,
        userConnectionId: '',
        mediatorConnectionId: '',
        didPublicKey: '',
        savedAt: new Date().toISOString(),
      });
    }

    // HTTP 전송 레이어 등록
    agent.registerOutboundTransport(new HttpOutboundTransport());

    agent.events.on(AgentEventTypes.AgentMessageReceived, event => {
      console.log(
        '📨 Mediator로부터 원시 메시지 수신:',
        JSON.stringify(event.payload, null, 2),
      );
    });
    agent.events.on(AgentEventTypes.AgentMessageProcessed, ({payload}) => {
      console.log('🔓 복호화된 메시지:', payload.message);

      // VC 관련 메시지 확인
      const message = payload.message as any;
      if (message && message['@type']) {
        const messageType = message['@type'] as string;
        console.log('📋 메시지 타입:', messageType);

        // VC 관련 메시지 타입 확인
        if (
          messageType.includes('issue-credential') ||
          messageType.includes('present-proof') ||
          messageType.includes('credential')
        ) {
          console.log('🎉 VC 관련 메시지 감지!');
          console.log('VC 메시지 내용:', JSON.stringify(message, null, 2));
        }
      }
    });

    // Credential 관련 이벤트 리스너 추가
    agent.events.on('CredentialStateChanged', event => {
      console.log('🎫 Credential 상태 변경:', event.payload);

      // VC 수신 감지
      if (event.payload && typeof event.payload === 'object') {
        const payload = event.payload as any;
        if (
          payload.credentialRecord &&
          payload.credentialRecord.state === 'credential-received'
        ) {
          console.log('🎉 VC 수신 감지!');
          console.log('VC 상세 정보:', {
            id: payload.credentialRecord.id,
            state: payload.credentialRecord.state,
            threadId: payload.credentialRecord.threadId,
          });
        }
      }
    });

    agent.events.on('CredentialExchangeStateChanged', event => {
      console.log('🔄 Credential Exchange 상태 변경:', event.payload);

      // Credential Exchange 완료 감지
      if (event.payload && typeof event.payload === 'object') {
        const payload = event.payload as any;
        if (
          payload.credentialExchangeRecord &&
          payload.credentialExchangeRecord.state === 'credential-issued'
        ) {
          console.log('🎉 Credential Exchange 완료!');
          console.log('Exchange 상세 정보:', {
            id: payload.credentialExchangeRecord.id,
            state: payload.credentialExchangeRecord.state,
            role: payload.credentialExchangeRecord.role,
          });
        }
      }
    });

    agent.events.on('CredentialStateChanged', event => {
      if (
        event.payload &&
        typeof event.payload === 'object' &&
        'credentialRecord' in event.payload &&
        typeof (event.payload as any).credentialRecord === 'object' &&
        (event.payload as any).credentialRecord !== null
      ) {
        const credentialRecord = (event.payload as any).credentialRecord;
        console.log('🎫 Credential 상태 변경:', credentialRecord.state);

        // VC가 최종적으로 지갑에 저장되었을 때의 상태는 'Done' 입니다.
        if (credentialRecord.state === CredentialState.Done) {
          console.log('🎉 VC 수신 및 저장 완료!');
          console.log('VC 상세 정보:', event.payload.credentialRecord);
          // 여기서 React Native의 상태(State)를 업데이트하여 UI에 반영합니다.
        }
      }
    });

    await agent.initialize();
    console.log('Agent 초기화 완료:', accountId);

    return agent;
  } catch (error) {
    console.log('Agent 초기화 에러:', error);
    throw error;
  }
};

export const setupConnectionEventListeners = (agent: Agent) => {
  agent.events.on<ConnectionStateChangedEvent>(
    ConnectionEventTypes.ConnectionStateChanged,
    event => {
      console.log('Connection state changed:', {
        connectionId: event.payload.connectionRecord.id,
        previousState: event.payload.previousState,
        newState: event.payload.connectionRecord.state,
      });
    },
  );
};

/**
 * Credo 공식 문서에 따른 연결 생성 함수
 * @see https://credo.js.org/
 */
export const generateConnection = async (
  agent: Agent,
  invitationUrl: string,
): Promise<{connectionRecord: ConnectionRecord | undefined}> => {
  console.log('연결 요청 시작...');
  try {
    // 1. 초대 URL 검증
    console.log('초대 URL 검증 중...');
    if (!invitationUrl || !invitationUrl.includes('?oob=')) {
      console.error('❌ 유효하지 않은 초대 URL 형식:', invitationUrl);
      throw new Error('유효하지 않은 초대 URL 형식');
    }

    // URL에서 oob 부분 추출
    const oobPart = invitationUrl.split('?oob=')[1];
    console.log('OOB 부분 추출됨:', oobPart ? '성공' : '실패');

    // 2. 네트워크 연결 테스트
    console.log('네트워크 연결 테스트 중...');
    try {
      const baseUrl = invitationUrl.split('?')[0];
      console.log('베이스 URL:', baseUrl);
      const testResponse = await fetch(baseUrl, {method: 'HEAD'});
      console.log(
        '네트워크 연결 테스트 결과:',
        testResponse.ok ? '성공' : '실패',
        testResponse.status,
      );
    } catch (networkError) {
      console.error('❌ 네트워크 연결 테스트 실패:', networkError);
      // 테스트 실패해도 계속 진행
    }

    // 3. 초대 URL 파싱 및 연결 설정
    console.log('초대 URL 파싱 중...');

    // 연결 시간 측정 시작
    const startTime = Date.now();

    // 에이전트 설정 확인 (이미 초기화 시 설정됨)
    console.log('DIDComm 메시지 타입:', agent.config.didCommMimeType);

    // 초대 수락 및 연결 생성 (단계별 처리)
    console.log('초대 수락 및 연결 생성 시작...');

    // 메시지 형식 설정 확인
    console.log('메시지 형식 확인 중...');

    // 초대 URL 디코딩 및 검증
    try {
      const oobData = decodeURIComponent(oobPart);
      console.log('OOB 데이터 디코딩 성공');

      // 디코딩된 데이터가 유효한 JSON인지 확인
      const parsedData = JSON.parse(oobData);
      console.log('OOB 데이터 구조:', JSON.stringify(parsedData, null, 2));

      if (parsedData['@type']) {
        console.log('유효한 DIDComm 메시지 형식 확인:', parsedData['@type']);
      } else {
        console.log(
          '경고: @type 필드가 없습니다. 호환성 문제가 발생할 수 있습니다.',
        );

        // @type 필드 없는 경우 처리 시도
        if (parsedData.services && Array.isArray(parsedData.services)) {
          console.log('서비스 엔드포인트 확인:', parsedData.services.length);
          parsedData.services.forEach((service: any, index: number) => {
            console.log(`서비스 ${index}:`, service);
          });
        }
      }
    } catch (parseError) {
      console.log('OOB 데이터 파싱 실패, 계속 진행합니다:', parseError);
    }

    // 초대 URL 처리 (표준 방식 사용)
    console.log('초대 URL 처리 시작...');

    // 초대 수락 및 연결 생성 (ACA-Py 호환성 모드)
    console.log('ACA-Py 호환성 모드로 초대 처리 시작...');

    // 1. URL에서 초대장 추출
    const outOfBandInvitation = await agent.oob.parseInvitation(invitationUrl);
    console.log('초대장 추출 성공:', {
      id: outOfBandInvitation.id,
      label: outOfBandInvitation.label,
    });

    // 2. 초대장 수락 설정
    const receiveOptions = {
      autoAcceptInvitation: true,
      autoAcceptConnection: true,
      reuseConnection: true,
    };

    // 3. 초대장 수락 및 연결 생성
    console.log('초대장 수락 시작...');

    // 초대장 형식 확인 및 로깅
    console.log('초대장 상세 정보:', {
      type: outOfBandInvitation.type,
      goalCode: outOfBandInvitation.goalCode,
      goal: outOfBandInvitation.goal,
      accept: outOfBandInvitation.accept,
      handshakeProtocols: outOfBandInvitation.handshakeProtocols,
    });

    // 메시지 형식 확인
    console.log('현재 메시지 형식 설정:', agent.config.didCommMimeType);

    const receiveResult = await agent.oob.receiveInvitation(
      outOfBandInvitation,
      receiveOptions,
    );

    const {connectionRecord, outOfBandRecord} = receiveResult;

    console.log('초대 수락 완료:', {
      outOfBandId: outOfBandRecord?.id,
      connectionId: connectionRecord?.id,
      connectionState: connectionRecord?.state,
    });

    // 결과 확인
    const receivedOutOfBandRecord = outOfBandRecord;

    // 연결 시간 측정 종료
    const connectionTime = Date.now() - startTime;
    console.log(`연결 처리 시간: ${connectionTime}ms`);

    console.log('초대 수신 결과:', {
      connectionRecord: connectionRecord
        ? {
            id: connectionRecord.id,
            state: connectionRecord.state,
            theirLabel: connectionRecord.theirLabel,
          }
        : '없음',
      outOfBandRecord: receivedOutOfBandRecord
        ? {
            id: receivedOutOfBandRecord.id,
            state: receivedOutOfBandRecord.state,
          }
        : '없음',
    });

    if (!connectionRecord) {
      console.error('❌ 연결 레코드가 생성되지 않음');
      return {connectionRecord: undefined};
    }

    console.log('✅ 연결 레코드 생성됨:', {
      id: connectionRecord.id,
      state: connectionRecord.state,
      theirLabel: connectionRecord.theirLabel,
    });

    // 4. 연결 완료 대기 (연결 상태 확인)
    console.log('연결 설정 대기 중...');

    // 연결 상태 확인을 위한 Promise 생성
    if (connectionRecord) {
      try {
        console.log('연결 상태 확인 시작:', connectionRecord.state);

        // 연결 상태가 완료될 때까지 대기 (최대 15초)
        let waitTime = 0;
        const maxWaitTime = 15000; // 15초
        const checkInterval = 1000; // 1초마다 확인

        // 연결 상태 변경 이벤트 리스너 설정
        const eventListener = ({payload}: ConnectionStateChangedEvent) => {
          if (
            payload.connectionRecord.id === connectionRecord.id &&
            (payload.connectionRecord.state === 'completed' ||
              payload.connectionRecord.state === 'abandoned')
          ) {
            console.log(
              `이벤트 리스너: 연결 상태 변경 감지 - ${payload.connectionRecord.state}`,
            );
            // 리스너 제거는 폴링 루프에서 처리
          }
        };

        // 이벤트 리스너 등록
        agent.events.on<ConnectionStateChangedEvent>(
          ConnectionEventTypes.ConnectionStateChanged,
          eventListener,
        );

        // 타임아웃 설정
        setTimeout(() => {
          // 타임아웃 시 리스너 제거는 폴링 루프에서 처리
          console.log('연결 대기 타임아웃 발생');
        }, maxWaitTime);

        // 폴링 방식과 이벤트 리스너 방식 병행
        while (waitTime < maxWaitTime) {
          // 현재 연결 상태 확인
          const currentConnection = await agent.connections.findById(
            connectionRecord.id,
          );
          if (currentConnection) {
            console.log(
              `연결 상태 확인 (${waitTime / 1000}초): ${
                currentConnection.state
              }`,
            );

            // 연결이 완료되었거나 실패했으면 대기 종료
            if (
              currentConnection.state === 'completed' ||
              currentConnection.state === 'abandoned'
            ) {
              console.log(`연결 상태 변경 감지: ${currentConnection.state}`);
              break;
            }
          }

          // 1초 대기
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waitTime += checkInterval;
        }

        console.log(`연결 대기 완료 (${waitTime / 1000}초 경과)`);
      } catch (waitError) {
        console.error('연결 대기 중 오류:', waitError);
      }
    } else {
      console.log('연결 레코드가 없어 대기 건너뜀');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 5. 최종 연결 상태 확인
    try {
      const updatedConnection = await agent.connections.findById(
        connectionRecord.id,
      );
      if (updatedConnection) {
        console.log('최종 연결 상태:', {
          id: updatedConnection.id,
          state: updatedConnection.state,
          theirLabel: updatedConnection.theirLabel,
          createdAt: updatedConnection.createdAt,
        });
      }
    } catch (checkError) {
      console.error('연결 상태 확인 실패:', checkError);
    }

    // 6. 연결 메타데이터 설정 (선택 사항)
    try {
      // 메타데이터 직접 설정 대신 로깅만 수행
      console.log('연결 메타데이터 정보:', {
        connectionType: connectionRecord.theirLabel?.includes('mediator')
          ? 'mediator'
          : 'user',
        connectedAt: new Date().toISOString(),
      });
    } catch (metadataError) {
      console.error('메타데이터 처리 실패:', metadataError);
    }

    return {connectionRecord};
  } catch (error) {
    console.error('❌ 연결 요청 실패:', error);
    throw error;
  }
};

/**
 * Credo 공식 문서에 따른 중계자 연결 함수
 * @see https://credo.js.org/
 */
export const generateMediatorConnection = async (
  agent: Agent,
  invitationUrl: string,
) => {
  console.log('중개자 연결 요청 시작...');
  try {
    // 1. 초대장 수락 및 연결
    const {connectionRecord} = await agent.oob.receiveInvitationFromUrl(
      invitationUrl,
      {
        autoAcceptConnection: true,
      },
    );

    if (!connectionRecord) throw new Error('중개자 연결에 실패했습니다.');

    // 2. 연결이 'completed' 상태가 될 때까지 대기
    const completedConnection = await agent.connections.returnWhenIsConnected(
      connectionRecord.id,
    );
    console.log(`✅ 중개자 연결 완료: ${completedConnection.state}`);

    // 3. 해당 연결을 기본 중개자로 프로비저닝 (요청과 설정이 한번에 처리됨)
    const mediationRecord = await agent.mediationRecipient.provision(
      completedConnection,
    );
    console.log(`✅ 중개자 프로비저닝 완료: ${mediationRecord.state}`);

    return {connectionRecord: completedConnection, mediationRecord};
  } catch (error) {
    console.error('❌ 중계자 연결 요청 실패:', error);
    throw error;
  }
};

/**
 * 두 개의 ACA-Py(User와 Mediator)에 순차적으로 연결하는 함수
 * @param agent Credo 에이전트
 * @param invitationUrls User ACA-Py(8020)와 Mediator ACA-Py(8010)의 초대 URL
 * @returns 연결된 커넥션 레코드
 *
 * invitationUrls.user: 8020 포트의 User ACA-Py 초대 URL
 * invitationUrls.mediator: 8010 포트의 Mediator ACA-Py 초대 URL
 */
export const generateBatchConnections = async (
  agent: Agent,
  invitationUrls: {mediator: string; user: string},
) => {
  try {
    console.log('순차적 연결 프로세스 시작...');
    console.log('초대 URL:', invitationUrls);

    // 결과를 저장할 변수들
    let userConnection: ConnectionRecord | undefined = undefined;
    let mediatorConnection: ConnectionRecord | undefined = undefined;
    let allConnections: ConnectionRecord[] = [];

    // 1. User ACA-Py 연결 시도 (8020 포트)
    console.log('=== 1단계: User ACA-Py 연결 시도 (8020 포트) ===');
    console.log('User ACA-Py URL:', invitationUrls.user);
    try {
      const userResult = await generateConnection(agent, invitationUrls.user);
      userConnection = userResult.connectionRecord;

      if (userConnection) {
        console.log('✅ User ACA-Py 연결 성공:', {
          id: userConnection.id,
          state: userConnection.state,
          theirLabel: userConnection.theirLabel,
        });
        allConnections.push(userConnection);

        // 연결이 성공하면 잠시 대기 (연결 안정화)
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('⚠️ User ACA-Py 연결 실패: 연결 레코드가 없음');
      }
    } catch (userError) {
      console.log('⚠️ User ACA-Py 연결 시도 중 에러:', userError);
      // 에러가 발생해도 계속 진행
    }

    // 2. Mediator 연결 시도 (8010 포트)
    console.log('=== 2단계: Mediator 연결 시도 (8010 포트) ===');
    console.log('Mediator ACA-Py URL:', invitationUrls.mediator);
    try {
      const mediatorResult = await generateMediatorConnection(
        agent,
        invitationUrls.mediator,
      );
      mediatorConnection = mediatorResult.connectionRecord;
      // const mediationRecord = mediatorResult.mediationRecord;

      if (mediatorConnection) {
        console.log('✅ Mediator 연결 성공:', {
          id: mediatorConnection.id,
          state: mediatorConnection.state,
          theirLabel: mediatorConnection.theirLabel,
        });
        allConnections.push(mediatorConnection);

        // 연결이 성공하면 잠시 대기 (연결 안정화)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('⚠️ Mediator 연결 실패: 연결 레코드가 없음');
      }
    } catch (mediatorError) {
      console.log('⚠️ Mediator 연결 시도 중 에러:', mediatorError);
      // 에러가 발생해도 계속 진행
    }

    // 3. 연결 상태 확인 및 대기
    console.log('=== 3단계: 연결 상태 최종 확인 ===');
    try {
      // 최종 연결 상태 확인
      if (userConnection) {
        const updatedUserConn = await agent.connections.findById(
          userConnection.id,
        );
        if (updatedUserConn) {
          console.log('User 연결 최종 상태:', updatedUserConn.state);
          userConnection = updatedUserConn;
        }
      }

      if (mediatorConnection) {
        const updatedMediatorConn = await agent.connections.findById(
          mediatorConnection.id,
        );
        if (updatedMediatorConn) {
          console.log('Mediator 연결 최종 상태:', updatedMediatorConn.state);
          mediatorConnection = updatedMediatorConn;
        }
      }
    } catch (checkError) {
      console.error('연결 상태 확인 실패:', checkError);
    }

    // 연결 결과 요약
    console.log('🎉 연결 프로세스 완료:', {
      userConnection: userConnection ? '성공' : '실패',
      mediatorConnection: mediatorConnection ? '성공' : '실패',
      totalConnections: allConnections.length,
    });

    // 두 연결이 모두 성공했는지 확인
    const allSuccess = userConnection && mediatorConnection;
    console.log(
      '두 ACA-Py 모두 연결 성공:',
      allSuccess ? '✅ 예' : '❌ 아니오',
    );

    if (allSuccess) {
      console.log(
        'User ACA-Py와 Mediator ACA-Py 모두 성공적으로 연결되었습니다.',
      );
    } else {
      console.log(
        '일부 ACA-Py 연결에 실패했습니다. 부분적으로 작동할 수 있습니다.',
      );
    }

    // 결과 반환
    return {
      userConnection,
      mediatorConnection,
      allConnections,
      allSuccess,
    };
  } catch (error) {
    console.log('❌ 연결 생성 중 예상치 못한 에러:', error);
    // 에러가 발생해도 빈 결과 반환 (로그인 프로세스가 계속 진행되도록)
    return {
      userConnection: undefined,
      mediatorConnection: undefined,
      allConnections: [],
      allSuccess: false,
    };
  }
};

// Agent의 public DID를 user-acy-py에게 comm 메시지로 보내는 함수
export const sendAgentPublicDidToUser = async (
  agent: Agent,
  userConnectionId: string,
) => {
  try {
    console.log('Agent의 public DID를 user-acy-py에게 전송 시작...');

    const didResult = await agent.dids.create({
      method: 'key',
      options: {
        keyType: 'ed25519',
      },
    });
    console.log('새 DID 생성 결과:', didResult);

    if (!didResult.didState.did) {
      throw new Error('새 DID 생성에 실패했습니다.');
    }

    // User ACA-Py에 DID만 전송 (요구사항에 맞게 간소화)
    const didValue = didResult.didState.did;
    console.log('전송할 새 DID:', didValue);

    // 요구사항에 맞게 content에 DID만 포함하여 전송 (did:key: 형식 확인)
    if (!didValue.startsWith('did:key:')) {
      console.warn('DID가 did:key: 형식이 아닙니다:', didValue);
    }

    await agent.basicMessages.sendMessage(userConnectionId, didValue);

    console.log('✅ Agent DID를 user-acy-py에게 전송 완료');
    return {did: didValue, keyType: 'ED25519'};
  } catch (error) {
    console.log('❌ Agent DID 정보를 user-acy-py에게 전송 실패:', error);
    throw error;
  }
};

export const saveConnectionInfo = async (
  allConnections: ConnectionRecord[],
  accountId: string,
) => {
  try {
    // 여기에 연결 정보 저장 로직 구현
    console.log('Connection 정보 저장 완료:', allConnections.length);
    return {success: true, count: allConnections.length};
  } catch (error) {
    console.log('Connection 정보 저장 에러:', error);
    throw error;
  }
};

/**
 * Mediator ACA-Py에서 VC를 폴링하는 함수
 * @param agent Credo 에이전트
 * @param maxAttempts 최대 시도 횟수
 * @param intervalMs 폴링 간격 (밀리초)
 */
export const pollMediatorForCredentials = async (
  agent: Agent,
  maxAttempts: number = 10,
  intervalMs: number = 2000,
): Promise<{success: boolean; message: string; credentials: any}> => {
  console.log('Mediator ACA-Py에서 VC 폴링 시작...');

  try {
    // 1. 기본 Mediator 확인 (Credo.js 표준 방식)
    const defaultMediator =
      await agent.mediationRecipient.findDefaultMediator();
    if (!defaultMediator) {
      console.log('⚠️ 기본 Mediator가 설정되지 않았습니다.');
      return {
        success: false,
        message: 'Mediator가 설정되지 않음',
        credentials: null,
      };
    }

    console.log('기본 Mediator 확인됨:', {
      id: defaultMediator.id,
      state: defaultMediator.state,
    });

    // 2. 메시지 픽업 요청 (Credo.js 표준 방식)
    console.log('메시지 픽업을 시작합니다...');
    await agent.mediationRecipient.initiateMessagePickup();

    // 3. 폴링 방식으로 VC 확인 (Credo.js 권장 방식)
    let attempts = 0;
    let credentials = null;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`VC 폴링 시도 ${attempts}/${maxAttempts}...`);

      try {
        // 현재 Credential 목록 확인 (Credo.js 표준 API)
        const allCredentials = await agent.credentials.getAll();
        console.log('현재 Credential 개수:', allCredentials.length);

        if (allCredentials.length > 0) {
          // 가장 최근 Credential 확인
          const latestCredential = allCredentials[allCredentials.length - 1];
          console.log('최신 Credential 상태:', {
            id: latestCredential.id,
            state: latestCredential.state,
            threadId: latestCredential.threadId,
          });

          // Credential이 완료된 상태인지 확인 (Credo.js 표준 상태)
          if (latestCredential.state === CredentialState.Done) {
            console.log('🎉 VC 수신 완료!');
            credentials = latestCredential;
            break;
          }
        }

        // 다음 시도 전 대기
        if (attempts < maxAttempts) {
          console.log(`${intervalMs}ms 대기 중...`);
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (pollError) {
        console.error(`폴링 시도 ${attempts} 중 오류:`, pollError);
      }
    }

    if (credentials) {
      console.log('✅ VC 폴링 성공!');
      return {
        success: true,
        message: 'VC 수신 성공',
        credentials: credentials,
      };
    } else {
      console.log('⚠️ VC 폴링 완료 - VC 없음');
      return {
        success: false,
        message: 'VC를 받지 못했습니다',
        credentials: null,
      };
    }
  } catch (error) {
    console.error('VC 폴링 중 오류 발생:', error);
    return {success: false, message: '폴링 중 오류 발생', credentials: null};
  }
};
