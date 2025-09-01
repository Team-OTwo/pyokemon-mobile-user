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
} from '@credo-ts/core';
import {AskarModule} from '@credo-ts/askar';
import {agentDependencies} from '@credo-ts/react-native';
import {ariesAskar} from '@hyperledger/aries-askar-react-native';
import {getInvitationUrls} from '../apis/did';

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

export const changeConnectionUrl = (url: string) => {
  // URL이 비어있거나 undefined인 경우 처리
  if (!url) {
    console.error('유효하지 않은 URL:', url);
    return url;
  }

  // localhost, user, mediator를 서버 IP로 변환
  try {
    let convertedUrl = url;
    console.log('원본 URL:', url);
    // localhost => 192.168.0.239
    convertedUrl = convertedUrl.replace('localhost', '192.168.0.239');
    // user => 192.168.0.239
    convertedUrl = convertedUrl.replace('user:', '192.168.0.239:');
    // mediator => 192.168.0.239
    convertedUrl = convertedUrl.replace('mediator:', '192.168.0.239:');

    console.log(`URL 변환: ${url} => ${convertedUrl}`);
    return convertedUrl;
  } catch (error) {
    console.error('URL 변환 중 오류 발생:', error);
    return url;
  }
};

// 전역 에이전트 변수 선언
let agent: Agent;

export const initAgent = async (accountId: string) => {
  try {
    // 지갑 ID가 고유하도록 타임스탬프 추가
    const walletId = `wallet-${accountId}-${Date.now()}`;
    const walletKey = `key-${accountId}-${Date.now()}`;

    console.log('지갑 설정:', {accountId, walletId, walletKey});

    // Credo 공식 문서에 따른 InitConfig 설정
    const config: InitConfig = {
      label: `${accountId}-agent`,
      walletConfig: {
        id: walletId,
        key: walletKey,
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
        basicMessages: new BasicMessagesModule(),
      },
    });

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
      const mediatorResult = await generateConnection(
        agent,
        invitationUrls.mediator,
      );
      mediatorConnection = mediatorResult.connectionRecord;

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

// 메시지 전송 함수 (현재 사용하지 않음)
// export const sendMessage = async (
//   agent: Agent,
//   connectionId: string,
//   message: string,
// ) => {
//   try {
//     await agent.basicMessages.sendMessage(connectionId, message);
//     console.log('메시지 전송 완료:', connectionId);
//   } catch (error) {
//     console.log('메시지 전송 에러:', error);
//     throw error;
//   }
// };

export const saveConnectionInfo = async (
  allConnections: ConnectionRecord[],
  accountId: string,
) => {
  try {
    // 여기에 연결 정보 저장 로직 구현
    console.log('Connection 정보 저장 완료:', allConnections.length);
  } catch (error) {
    console.log('Connection 정보 저장 에러:', error);
    throw error;
  }
};

// Agent DID 공개키 전송 함수 (현재 사용하지 않음)
// export const sendAgentDidPublicKeyToUser = async (
//   agent: Agent,
//   userConnectionId: string,
// ) => {
//   try {
//     console.log('Agent의 기존 DID 공개키를 User ACA-Py에게 전송 시작...');

//     // Agent의 기존 DID 목록 가져오기
//     const dids = await agent.dids.getCreatedDids();
//     console.log('Agent DIDs:', dids);

//     if (!dids || dids.length === 0) {
//       throw new Error('Agent에 생성된 DID가 없습니다.');
//     }

//     // Key DID를 우선적으로 찾거나, 첫 번째 DID 사용
//     let agentDidInfo = null;
//     for (const did of dids) {
//       if (did.did && did.did.startsWith('did:key:')) {
//         agentDidInfo = did;
//         break;
//       }
//     }

//     if (!agentDidInfo) {
//       agentDidInfo = dids[0];
//     }

//     if (!agentDidInfo || !agentDidInfo.did) {
//       throw new Error('Agent DID 정보를 찾을 수 없습니다.');
//     }

//     console.log('전송할 Agent DID:', agentDidInfo.did);

//     // User ACA-Py에게 Agent DID 문자열만 전송
//     const userMessage = agentDidInfo.did;
//     await agent.basicMessages.sendMessage(userConnectionId, userMessage);

//     console.log('✅ Agent DID 공개키를 User ACA-Py에게 전송 완료');
//     return {
//       did: agentDidInfo.did,
//       publicKey: agentDidInfo.did, // 간단하게 DID 자체를 publicKey로 반환
//     };
//   } catch (error) {
//     console.log('❌ Agent DID 공개키를 User ACA-Py에게 전송 실패:', error);
//     throw error;
//   }
// };
