import {
  createAgent,
  IResolver,
  IDIDManager,
  ICredentialPlugin,
  IKeyManager,
} from "@veramo/core";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { KeyDIDProvider } from "@veramo/did-provider-key";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as webDIDResolver } from "web-did-resolver";
import { CredentialPlugin } from "@veramo/credential-w3c";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  LdDefaultContexts,
  
  ContextDoc,
} from "@veramo/credential-ld";
import { RecordLike, OrPromise } from "@veramo/utils";

const contextMaps: RecordLike<OrPromise<ContextDoc>>[] = [
  LdDefaultContexts
];

export const setupAgent = (name: string) => {
  return createAgent<
    IKeyManager &
      IDIDManager &
      IResolver &
      ICredentialPlugin &
      ICredentialIssuerLD
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
          "did:web": new KeyDIDProvider({
            defaultKms: "local",
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...webDIDResolver(),
        }),
      }),
      new CredentialPlugin(),
      new CredentialIssuerLD({
        contextMaps: contextMaps,
        suites: []
      })
    ],
  });
};
