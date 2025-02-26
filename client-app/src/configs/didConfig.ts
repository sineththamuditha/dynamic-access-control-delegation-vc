import {
  createAgent,
  IResolver,
  IDIDManager,
  ICredentialPlugin,
  IKeyManager,
  IMessageHandler,
} from "@veramo/core";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { WebDIDProvider } from "@veramo/did-provider-web";
import { EthrDIDProvider } from "@veramo/did-provider-ethr"
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as WebDIDResolver } from "web-did-resolver";
import { getResolver as EthrDidResolver } from "ethr-did-resolver";
import { CredentialPlugin } from "@veramo/credential-w3c";
import { DIDComm, DIDCommMessageHandler, IDIDComm } from "@veramo/did-comm"
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { CredentialIssuerLD, ICredentialIssuerLD} from "@veramo/credential-ld";
import { CONFIG } from "../constants";
import { JsonRpcProvider, Network } from 'ethers';
import { MessageHandler } from "@veramo/message-handler";


export const setupAgent = () => {

  const DEFAULT_KMS = 'local';

  const MAINNET_TESTNET_CHAINID = 1;
  const MAINNET_TESTNET_RPC_URL = `https://mainnet.infura.io/v3/${CONFIG.INFURA_PROJECT_ID}`;
  const MAINNET_TESTNET_NAMESPACE = 'mainnet';
  const MAINNET_TESTNET_REGISTRY = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'

  return createAgent<
    IKeyManager &
      IDIDManager &
      IResolver &
      ICredentialPlugin &
      ICredentialIssuerLD &
      IDIDComm & 
      IMessageHandler
  >({
    plugins: [
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: {
          local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
        },
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: "did:web",
        providers: {
          "did:web": new WebDIDProvider({
            defaultKms: DEFAULT_KMS,
          }),
          "did:ethr": new EthrDIDProvider({
            defaultKms: DEFAULT_KMS,
            networks: [
              {
                name: MAINNET_TESTNET_NAMESPACE,
                provider: new JsonRpcProvider(
                  MAINNET_TESTNET_RPC_URL,
                  MAINNET_TESTNET_CHAINID,
                  { staticNetwork: Network.from(MAINNET_TESTNET_CHAINID)}
                ),
                rpcUrl: MAINNET_TESTNET_RPC_URL,
                chainId: MAINNET_TESTNET_CHAINID,
                registry: MAINNET_TESTNET_REGISTRY
              }
            ]
          })
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...WebDIDResolver(),
          ...EthrDidResolver({
            infuraProjectId: CONFIG.INFURA_PROJECT_ID
          })
        }),
      }),
      new CredentialPlugin(),
      new CredentialIssuerLD({
        contextMaps: [],
        suites: []
      }),
      new DIDComm(),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler()
        ]
      })
    ],
  });
};
