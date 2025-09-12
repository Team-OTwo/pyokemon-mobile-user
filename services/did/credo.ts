import '@hyperledger/aries-askar-react-native';
import 'react-native-get-random-values';
import 'react-native-quick-crypto'; // crypto 폴리필

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
  MediationRecipientModule,
  CredentialsModule,
  CredentialState,
  AutoAcceptCredential,
  ProofsModule,
  KeyType,
  CredentialExchangeRecord,
  JwsService,
  MessagePickupModule,
  MediatorPickupStrategy,
  WsOutboundTransport,
  W3cCredentialsModule,
  V2CredentialProtocol,
  JsonLdCredentialFormatService,
  V2MessagePickupProtocol,
  AutoAcceptProof,
  V1MessagePickupProtocol,
  DefaultMessagePickupProtocols,
  CredentialEventTypes,
  KeyDidResolver,
  PeerDidResolver,
  KeyDidRegistrar,
  PeerDidRegistrar,
  V2ProofProtocol,
  ConsoleLogger,
  LogLevel,
  CredentialStateChangedEvent,
  WebDidResolver,
  MediatorModule,
  ProofRepository,
} from '@credo-ts/core';
import {AskarModule} from '@credo-ts/askar';
import {agentDependencies} from '@credo-ts/react-native';
import {ariesAskar} from '@hyperledger/aries-askar-react-native';
import {getInvitationUrls} from '../apis/did';
import {getWalletInfo, saveWalletInfo} from '../storage/walletStorage';
import {
  AnonCredsCredentialFormatService,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
} from '@credo-ts/anoncreds';
import {MessageForwardingStrategy} from '@credo-ts/core/build/modules/routing/MessageForwardingStrategy';

// ============================================================================
// 상수 정의
// ============================================================================

const DEFAULT_MESSAGE_PROCESSING_DELAY = 10000; // 10초
const DEFAULT_BATCH_SIZE = 50;
// ============================================================================
// 유틸리티 함수
// ============================================================================

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

// ============================================================================
// Agent 초기화 및 설정
// ============================================================================

export const initAgent = async (
  accountId: string,
  walletId?: string,
  walletKey?: string,
) => {
  try {
    // 저장된 지갑 정보가 있으면 사용, 없으면 새로 생성
    let finalWalletId = walletId || `wallet-${accountId}`;
    let finalWalletKey = walletKey || `key-${accountId}`;

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
      // autoUpdateStorageOnStartup: true,
      // 두 ACA-Py 모두 연결할 수 있도록 엔드포인트 설정
      // DIDComm 메시지 타입 설정 (ACA-Py와 호환성 보장)
      logger: new ConsoleLogger(LogLevel.trace),
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
        dids: new DidsModule({
          registrars: [
            new KeyDidRegistrar(),
            new PeerDidRegistrar(),
            new KeyDidRegistrar(),
          ],
          resolvers: [
            new KeyDidResolver(),
            new PeerDidResolver(),
            new WebDidResolver(),
          ],
        }),
        aries: new AskarModule({
          ariesAskar,
          // Askar 설정 최적화 - 기본 설정 사용
        }),
        basicMessages: new BasicMessagesModule(),
        proofs: new ProofsModule({
          autoAcceptProofs: AutoAcceptProof.Always, // 수동으로 처리하여 proof purpose 문제 해결
          proofProtocols: [
            new V2ProofProtocol({
              proofFormats: [
                new LegacyIndyProofFormatService(),
                new AnonCredsProofFormatService(),
              ],
            }),
          ],
        }),
        w3cVc: new W3cCredentialsModule({}),
        credentials: new CredentialsModule({
          autoAcceptCredentials: AutoAcceptCredential.Never,
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [
                new JsonLdCredentialFormatService(),
                new AnonCredsCredentialFormatService(),
                new LegacyIndyCredentialFormatService(),
              ],
            }),
          ],
        }),
        mediationRecipient: new MediationRecipientModule({
          mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
          mediatorPollingInterval: 1000,
        }),
        messagePickup: new MessagePickupModule<DefaultMessagePickupProtocols>({
          protocols: [
            new V1MessagePickupProtocol(),
            new V2MessagePickupProtocol(),
          ],
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

    agent.registerOutboundTransport(new HttpOutboundTransport());
    agent.registerOutboundTransport(new WsOutboundTransport());

    // 이벤트 바인딩 (생략 가능: 필요하면 여기서 추가)

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

    await agent.initialize();

    agent.events.on<CredentialStateChangedEvent>(
      CredentialEventTypes.CredentialStateChanged,
      async ({payload}) => {
        const {credentialRecord} = payload;

        // 상태 변화를 '관찰'하고 로그를 기록하거나 UI를 업데이트합니다.
        console.log(`🎫 Credential 상태 변경: ${credentialRecord.state}`);

        // 각 상태별 로그만 출력 (자동 처리 로직 제거)
        if (credentialRecord.state === CredentialState.OfferReceived) {
          console.log('새로운 VC 제안 수신 - 수동으로 처리해야 합니다');

          try {
            const credentialRequest = await agent.credentials.acceptOffer({
              credentialRecordId: credentialRecord.id,
              credentialFormats: {
                jsonld: {
                  proof: {
                    proofType: 'Ed25519Signature2020',
                    proofPurpose: 'assertionMethod', // 'assertionMethod'로 지정
                  },
                },
              },
            });
            console.log(
              'VC 요청이 성공적으로 전송되었습니다:',
              credentialRequest,
            );
          } catch (error) {
            console.error('acceptOffer 처리 중 오류 발생:', error);
          }
        } else if (credentialRecord.state === CredentialState.RequestSent) {
          console.log('credentialRecord ID:', credentialRecord.id);
        } else if (
          credentialRecord.state === CredentialState.CredentialReceived
        ) {
          console.log('credentialRecord ID:', credentialRecord.id);
        } else if (credentialRecord.state === CredentialState.Done) {
          console.log('🎉 VC 발급이 성공적으로 완료되었습니다!');
          console.log('credentialRecord ID:', credentialRecord.id);
        } else if (credentialRecord.state === CredentialState.Abandoned) {
          console.error(`🚨 VC 발급 실패: ${credentialRecord.errorMessage}`);
          console.log('credentialRecord ID:', credentialRecord.id);
        }
      },
    );

    return agent;
  } catch (error) {
    console.log('Agent 초기화 에러:', error);
    throw error;
  }
};

// ============================================================================
// 연결 관리
// ============================================================================

/**
 * Credo 공식 문서에 따른 연결 생성 함수
 * @see https://credo.js.org/
 */
export const generateConnection = async (
  agent: Agent,
  invitationUrl: string,
) => {
  const didResult = await agent.dids.create({
    method: 'peer',
  });

  const result = await agent.oob.receiveInvitationFromUrl(invitationUrl, {
    ourDid: didResult.didState.did,
    autoAcceptInvitation: true,
    autoAcceptConnection: true,
  });

  if (!result || !result.connectionRecord) {
    throw new Error('User-py 연결에 실패했습니다: connectionRecord가 없음');
  }

  const {connectionRecord} = result;

  // 타임아웃과 함께 연결 완료 대기
  const completedConnection = await agent.connections.returnWhenIsConnected(
    connectionRecord.id,
  );

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

  return {connectionRecord: completedConnection};
};

export const generateMediatorConnection = async (
  agent: Agent,
  invitationUrl: string,
) => {
  console.log('중개자 연결 요청 시작...');
  try {
    // 1. 초대장 수락 및 연결
    const result = await agent.oob.receiveInvitationFromUrl(invitationUrl, {
      autoAcceptConnection: true,
    });

    if (!result || !result.connectionRecord) {
      throw new Error('중개자 연결에 실패했습니다: connectionRecord가 없음');
    }

    const {connectionRecord} = result;

    // 2. 타임아웃과 함께 연결이 'completed' 상태가 될 때까지 대기
    const completedConnection = await agent.connections.returnWhenIsConnected(
      connectionRecord.id,
    );

    // 3. 해당 연결을 기본 중개자로 프로비저닝 (요청과 설정이 한번에 처리됨)
    const mediationRecord = await agent.mediationRecipient.provision(
      completedConnection,
    );
    console.log(`✅ 중개자 프로비저닝 완료: ${mediationRecord.state}`);

    return {connectionRecord: completedConnection, mediationRecord};
  } catch (error) {
    console.error(`❌ 중개자 연결 시도 실패:`, error);
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

    // 1. Mediator 연결 시도 (8010 포트)
    console.log('=== 1단계: Mediator 연결 시도 (8010 포트) ===');
    console.log('Mediator ACA-Py URL:', invitationUrls.mediator);
    console.log('연결 시작 전 3초 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      // mediator 연결 시도
      const mediatorResult = await generateMediatorConnection(
        agent,
        invitationUrls.mediator,
      );
      if (!mediatorResult) {
        throw new Error('Mediator 연결 결과가 없음');
      }
      mediatorConnection = mediatorResult.connectionRecord;

      if (mediatorConnection) {
        console.log('✅ Mediator 연결 성공:', {
          id: mediatorConnection.id,
          state: mediatorConnection.state,
          theirLabel: mediatorConnection.theirLabel,
        });
        allConnections.push(mediatorConnection);

        await new Promise(resolve => setTimeout(resolve, 5000));
        // await agent.mediationRecipient.initiateMessagePickup();
        // 연결이 성공하면 잠시 대기 (연결 안정화)
      } else {
        console.log('⚠️ Mediator 연결 실패: 연결 레코드가 없음');
      }
    } catch (mediatorError) {
      console.log('⚠️ Mediator 연결 시도 중 에러:', mediatorError);
      // 에러가 발생해도 계속 진행
      throw mediatorError;
    }

    try {
      console.log('User 연결 시작...');
      // user aca-py 연결
      const userResult = await generateConnection(agent, invitationUrls.user);
      if (!userResult) {
        console.log('⚠️ User 연결 결과가 없음');
        throw new Error('User 연결 결과가 없음');
      }
      userConnection = userResult.connectionRecord;

      if (userConnection) {
        console.log('✅ User ACA-Py 연결 성공:', {
          id: userConnection.id,
          state: userConnection.state,
          theirLabel: userConnection.theirLabel,
        });
        allConnections.push(userConnection);

        // 연결이 성공하면 잠시 대기 (연결 안정화)
        console.log('User 연결 안정화를 위해 5초 대기...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log('⚠️ User ACA-Py 연결 실패: 연결 레코드가 없음');
      }
    } catch (userError) {
      console.log('⚠️ User ACA-Py 연결 시도 중 에러:', userError);
      throw userError;
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
    const didResult = await agent.dids.create({
      method: 'key',
      options: {
        keyType: KeyType.Ed25519,
      },
    });

    if (!didResult.didState.did) {
      throw new Error('새 DID 생성에 실패했습니다.');
    }

    const didValue = didResult.didState.did;

    if (!didValue.startsWith('did:key:')) {
      console.warn('DID가 did:key: 형식이 아닙니다:', didValue);
    }

    await agent.basicMessages.sendMessage(userConnectionId, didValue);

    return {did: didValue, keyType: 'ED25519'};
  } catch (error) {
    console.error('Agent DID 전송 실패:', error);
    throw error;
  }
};

export const saveConnectionInfo = async (
  allConnections: ConnectionRecord[],
  accountId: string,
) => {
  try {
    return {success: true, count: allConnections.length};
  } catch (error) {
    console.error('Connection 정보 저장 에러:', error);
    throw error;
  }
};

// polling credentials from mediator
export const syncCredentialsFromMediator = async (
  agent: Agent,
): Promise<{success: boolean; newCredentials: CredentialExchangeRecord[]}> => {
  console.log('[VC 동기화 시작] 중개자로부터 새로운 VC를 확인합니다...');

  try {
    // 1. Mediator가 있는지 확인합니다.
    const mediators = await agent.mediationRecipient.getMediators();
    if (mediators.length === 0) {
      console.warn('⚠️ 활성 Mediator가 없습니다.');
      return {success: false, newCredentials: []};
    }
    console.log(`✅ 활성 Mediator 확인: ${mediators[0].id}`);

    // 2. 현재 VC 목록을 가져옵니다.
    const beforeCredentials: CredentialExchangeRecord[] =
      await agent.credentials.getAll();
    console.log('동기화 전 VC 개수:', beforeCredentials.length);

    // 4. 메시지 픽업 (가장 유력한 방법만 사용)
    console.log('🔄 메시지 픽업 시작...');
    try {
      // const pickupResult: any = await agent.messagePickup.pickupMessages({
      //   protocolVersion: 'v2',
      //   connectionId: mediators[0].connectionId!,
      //   batchSize: DEFAULT_BATCH_SIZE,
      // });
      const pickupResult: any =
        await agent.mediationRecipient.initiateMessagePickup(
          mediators[0],
          MediatorPickupStrategy.Implicit,
        );

      if (pickupResult && pickupResult.messages.length > 0) {
        for (const msg of pickupResult.messages) {
          try {
            // Credential 처리
            await agent.credentials.proposeCredential(msg);
            console.log('VC 처리 완료:', msg.id);
          } catch (err) {
            console.error('VC 처리 실패:', err);
          }
        }
      } else {
        console.log('새로운 VC 없음');
      }

      console.log('📦 메시지 픽업 결과:', {
        pickupResult,
      });
      console.log('✅ V2 프로토콜로 메시지 픽업 완료');
    } catch (error) {
      console.log('⚠️ 메시지 픽업 실패:', error);
    }

    // 5. 메시지 처리 대기 (시간 증가)
    console.log('⏳ 메시지 처리 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. 메시지 처리 후 credential 목록 확인
    const afterCredentials = await agent.credentials.getAll();
    console.log(
      '📋 메시지 처리 후 전체 credential 개수:',
      afterCredentials.length,
    );

    // 7. 새로 완료된 credential 찾기
    const newlyCompletedCredentials: typeof afterCredentials = [];
    for (const credential of afterCredentials) {
      const wasInBefore = beforeCredentials.some(
        beforeCred => beforeCred.id === credential.id,
      );
      if (!wasInBefore) {
        newlyCompletedCredentials.push(credential);
        console.log(`🎉 새로 완료된 VC 발견: ${credential.id}`);
      }
      console.log('🔍 메시지 처리 후 credential 데이터:', wasInBefore);
    }

    // 8. 결과 반환
    if (newlyCompletedCredentials.length > 0) {
      console.log(
        `🎉 총 ${newlyCompletedCredentials.length}개의 새로운 VC를 발견했습니다!`,
      );

      const credentialsWithData: any[] = [];
      for (const credential of newlyCompletedCredentials) {
        try {
          // W3cCredentialRecord에서 직접 credential 데이터 가져오기
          const credentialData = credential.credentials;
          if (credentialData) {
            credentialsWithData.push({
              ...credential,
              credentialData: credentialData,
            });
          } else {
            credentialsWithData.push(credential);
          }
        } catch (error) {
          console.error(
            `❌ Credential ${credential.id} 데이터 가져오기 실패:`,
            error,
          );
          credentialsWithData.push(credential);
        }
      }

      return {success: true, newCredentials: credentialsWithData};
    } else {
      console.log('✅ 새로운 VC가 없습니다.');
      return {success: true, newCredentials: []};
    }
  } catch (error) {
    console.error('VC 동기화 중 오류 발생:', error);
    return {success: false, newCredentials: []};
  }
};

export const signDidToJwt = async (
  agent: Agent,
  publicDid: string,
): Promise<{success: boolean; message: string; jwt: string | null}> => {
  try {
    // 1. JwsService 인스턴스 생성
    const jwsService = new JwsService();

    // 2. 키 생성
    const key = await agent.wallet.createKey({
      keyType: KeyType.Ed25519,
    });

    const kid = `${publicDid}#${publicDid.split(':')[2]}`;
    // 4. JWT 생성 - 문자열로 직접 전달
    const jws = await jwsService.createJws(agent.context, {
      payload: `{"did":"${publicDid}"}` as any,
      key,
      header: {
        typ: 'JWT',
        alg: 'EdDSA',
        kid: kid,
      },
      protectedHeaderOptions: {
        typ: 'JWT',
        alg: 'EdDSA',
        kid: kid,
      },
    });

    console.log('✅ JWT 생성 성공:', JSON.stringify(jws));
    const jwtString = `${jws.protected}.${jws.payload}.${jws.signature}`;

    return {success: true, message: 'JWT 생성 성공', jwt: jwtString};
  } catch (error: any) {
    console.error('❌ JWT 생성 실패:', error);
    return {
      success: false,
      message: `JWT 생성 실패: ${error}`,
      jwt: null,
    };
  }
};

// ============================================================================
// 프루프 관리
// ============================================================================

export const generateVenueConnection = async (
  agent: Agent,
  invitationUrl: string,
) => {
  try {
    console.log('🎯 Venue 연결 프로세스 시작...');
    console.log('Venue invitation URL:', invitationUrl);

    // venue 연결 시도
    const venueResult = await generateConnection(agent, invitationUrl);
    if (!venueResult) {
      throw new Error('Venue 연결 결과가 없음');
    }

    const venueConnection = venueResult.connectionRecord;

    if (venueConnection) {
      console.log('✅ Venue 연결 성공:', {
        id: venueConnection.id,
        state: venueConnection.state,
        theirLabel: venueConnection.theirLabel,
      });

      // 연결 안정화를 위해 대기
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        connectionRecord: venueConnection,
        success: true,
      };
    } else {
      console.log('⚠️ Venue 연결 실패: 연결 레코드가 없음');
      return {
        connectionRecord: undefined,
        success: false,
      };
    }
  } catch (error) {
    console.error('❌ Venue 연결 실패:', error);
    return {
      connectionRecord: undefined,
      success: false,
      error: error,
    };
  }
};
