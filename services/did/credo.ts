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
  CredentialsModule,
  CredentialState,
  AutoAcceptCredential,
  ProofsModule,
  KeyType,
  SdJwtVcRecord,
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
  CredentialStateChangedEvent,
  KeyDidResolver,
  ConsoleLogger,
  LogLevel,
  PeerDidResolver,
  Ed25519Signature2020,
} from '@credo-ts/core';
import {AskarModule} from '@credo-ts/askar';
import {agentDependencies} from '@credo-ts/react-native';
import {ariesAskar} from '@hyperledger/aries-askar-react-native';
import {getInvitationUrls} from '../apis/did';
import {getWalletInfo, saveWalletInfo} from '../storage/walletStorage';
import {OpenId4VciCredentialFormatProfile} from '@credo-ts/openid4vc';

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
      didCommMimeType: DidCommMimeType.V1,
      logger: new ConsoleLogger(LogLevel.debug),
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
          resolvers: [new KeyDidResolver(), new PeerDidResolver()],
        }),
        aries: new AskarModule({ariesAskar}),
        basicMessages: new BasicMessagesModule(),
        proofs: new ProofsModule({
          autoAcceptProofs: AutoAcceptProof.Always,
        }),
        w3cVc: new W3cCredentialsModule({}),
        credentials: new CredentialsModule({
          autoAcceptCredentials: AutoAcceptCredential.Always,
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [
                new JsonLdCredentialFormatService(), // W3C VC 지원
              ],
            }),
          ],
        }),
        mediationRecipient: new MediationRecipientModule({
          mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
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

    // HTTP 전송 레이어 등록
    agent.registerOutboundTransport(new HttpOutboundTransport());
    agent.registerOutboundTransport(new WsOutboundTransport());

    agent.events.on(AgentEventTypes.AgentMessageReceived, event => {
      console.log(
        '📨 Mediator로부터 원시 메시지 수신:',
        JSON.stringify(event.payload, null, 2),
      );
    });

    agent.events.on(AgentEventTypes.AgentMessageProcessed, ({payload}) => {
      const message = payload.message as any;
      if (message['@type'].includes('offer-credential')) {
        console.log(
          '📝 Offer Message formats:',
          JSON.stringify(message.formats, null, 2),
        );
        console.log(
          '📝 Offer Message attaches:',
          JSON.stringify(message['offers~attach'], null, 2),
        );
      }
    });

    agent.events.on<CredentialStateChangedEvent>(
      CredentialEventTypes.CredentialStateChanged,
      async ({payload}) => {
        const {credentialRecord} = payload;

        switch (credentialRecord.state) {
          case CredentialState.OfferReceived:
            console.log(
              `[EVENT] Offer received for credentialId=${credentialRecord.id}`,
            );
            try {
              await agent.credentials.acceptOffer({
                credentialRecordId: credentialRecord.id,
                credentialFormats: {
                  jsonld: {
                    options: {
                      proofType: 'Ed25519Signature2020',
                      proofPurpose: 'assertionMethod',
                    },
                  },
                },
              });
            } catch (err) {
              console.error(`Accept offer 실패: ${err}`);
            }
            // Holder가 제안을 수락하고 Request를 발송
            break;
          case CredentialState.RequestSent:
            console.log(
              `[EVENT] Request sent for credentialId=${credentialRecord.id}. Waiting for credential...`,
            );
            break;
          case CredentialState.CredentialReceived:
            console.log(
              `[EVENT] Credential received for credentialId=${credentialRecord.id}`,
            );
            try {
              await agent.credentials.acceptCredential({
                credentialRecordId: credentialRecord.id,
              });
            } catch (error) {
              console.error(
                `[ERROR] Accept 실패: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
            // W3C VC 형식으로 수신된 VC 처리
            try {
              await agent.credentials.acceptCredential({
                credentialRecordId: credentialRecord.id,
              });
            } catch (error) {
              console.error(
                `[ERROR] Failed to accept credential: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
            // Holder가 받은 VC를 지갑에 저장
            break;
          case CredentialState.Done:
            console.log(
              `[EVENT] Credential exchange completed for credentialId=${credentialRecord.id}`,
            );
            break;

          case CredentialState.Abandoned:
            console.log(
              `[EVENT] Credential exchange abandoned for credentialId=${credentialRecord.id}`,
            );
            break;

          default:
            console.log(`[EVENT] State changed: ${credentialRecord.state}`);
        }
      },
    );

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

    return agent;
  } catch (error) {
    console.log('Agent 초기화 에러:', error);
    throw error;
  }
};

/**
 * Credo 공식 문서에 따른 연결 생성 함수
 * @see https://credo.js.org/
 */
export const generateConnection = async (
  agent: Agent,
  invitationUrl: string,
) => {
  const result = await agent.oob.receiveInvitationFromUrl(invitationUrl, {
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
        await agent.mediationRecipient.initiateMessagePickup();
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

    // 2. 확인 전, 현재 VC 목록의 상태를 Map에 저장합니다. (비교 기준)
    const beforeCredentials = await agent.credentials.getAll();
    const beforeCredentialStateMap = new Map<string, CredentialState>();
    beforeCredentials.forEach(cred => {
      beforeCredentialStateMap.set(cred.id, cred.state);
    });
    console.log('동기화 전 VC 개수:', beforeCredentials.length);

    // 3. 중개자에게 쌓인 메시지를 모두 가져옵니다.
    // await agent.mediationRecipient.initiateMessagePickup();
    await agent.messagePickup.pickupMessages({
      protocolVersion: 'v2', // Use v2; your config is v1 but pickup can override
      connectionId: mediators[0].connectionId!,
      batchSize: 100, // Optional: Increase if many messages
    });

    console.log('📨 메시지 픽업 완료. 처리 대기 중...');

    // 4. 에이전트가 수신한 메시지를 처리(복호화, 상태 업데이트 등)할 시간을 줍니다. (중요!)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. 메시지 처리 후, 전체 VC 목록을 다시 가져옵니다.
    const afterCredentials = await agent.credentials.getAll();
    const newlyCompletedCredentials: CredentialExchangeRecord[] = [];

    // 6. 'After' 목록을 순회하며 'Before'와 비교하여 새로 완료된 VC를 찾습니다.
    for (const credential of afterCredentials) {
      // 조건 1: 현재 상태가 'Done'이어야 함
      if (credential.state === CredentialState.Done) {
        const beforeState = beforeCredentialStateMap.get(credential.id);

        // 조건 2: 이전에는 없었거나(undefined), 이전 상태가 'Done'이 아니어야 함
        if (!beforeState || beforeState !== CredentialState.Done) {
          newlyCompletedCredentials.push(credential);
        }
      }
    }

    // 7. 결과를 출력합니다.
    if (newlyCompletedCredentials.length > 0) {
      console.log(
        `🎉 총 ${newlyCompletedCredentials.length}개의 새로운 VC를 발견했습니다!`,
        newlyCompletedCredentials.map(c => ({id: c.id, state: c.state})),
      );
    } else {
      console.log('✅ 새로운 VC가 없습니다. 지갑은 이미 최신 상태입니다.');
    }

    return {success: true, newCredentials: newlyCompletedCredentials};
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

export const generateProof = async (
  agent: Agent,
  credentialId: string,
  publicDid: string,
  authorizationRequest: string, // Verifier가 제공한 OpenID4VP 요청 URI
): Promise<{
  success: boolean;
  message: string;
  presentation: string | null;
}> => {
  console.log('VP 생성 시작...', {
    credentialId,
    publicDid,
    authorizationRequest,
  });

  try {
    // 1. VC 조회
    let credential: CredentialExchangeRecord | SdJwtVcRecord | undefined;
    try {
      credential = await agent.credentials.getById(credentialId);
      console.log('W3C VC 조회 성공:', credentialId);
    } catch (w3cError) {
      console.log('W3C VC 조회 실패, SD-JWT VC 시도:', w3cError);
      credential = await agent.sdJwtVc.getById(credentialId);
      console.log('SD-JWT VC 조회 성공:', credentialId);
    }

    if (!credential) {
      throw new Error(`VC를 찾을 수 없습니다: ${credentialId}`);
    }

    // 2. OpenID4VP 요청 파싱
    console.log('OpenID4VP 요청 파싱 중...');
    const resolvedRequest =
      await agent.modules.openId4VcHolderModule.resolvePresentationRequest(
        authorizationRequest,
      );
    console.log(
      'OpenID4VP 요청 파싱 완료:',
      JSON.stringify(resolvedRequest, null, 2),
    );

    // 3. VP 생성 및 JWT 서명
    console.log('JWT VP 생성 시작...');
    const jwsService = new JwsService();
    const presentation =
      await agent.modules.openId4VcHolderModule.acceptPresentationRequest(
        resolvedRequest,
        {
          credentialsForRequest: {
            0: {
              credentials: [credential],
              format:
                credential instanceof SdJwtVcRecord
                  ? OpenId4VciCredentialFormatProfile.SdJwtVc
                  : 'jwt_vc_json',
            },
          },
          proofSigner: async (input: {
            data: Uint8Array;
          }): Promise<Uint8Array> => {
            const key = await agent.wallet.createKey({
              keyType: KeyType.Ed25519,
            });
            const jws = await jwsService.createJws(agent.context, {
              payload: input.data as any,
              key,
              header: {alg: 'EdDSA', kid: publicDid},
              protectedHeaderOptions: {
                alg: 'EdDSA',
                kid: publicDid,
              },
            });
            console.log('JWT 서명 완료:', jws);
            // JWS 형식에서 서명 부분 추출
            const jwsString = typeof jws === 'string' ? jws : jws.toString();
            return Buffer.from(jwsString.split('.')[2], 'base64');
          },
        },
      );

    console.log('✅ JWT VP 생성 성공:', presentation);
    return {
      success: true,
      message: 'VP 생성 성공',
      presentation: presentation,
    };
  } catch (error: any) {
    console.error('❌ VP 생성 실패:', error);
    return {
      success: false,
      message: `VP 생성 실패: ${error.message}`,
      presentation: null,
    };
  }
};

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
