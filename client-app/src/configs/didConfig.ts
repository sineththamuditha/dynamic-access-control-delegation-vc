import {
  createAgent,
  IResolver,
  IDIDManager,
  ICredentialPlugin,
  IKeyManager,
} from "@veramo/core";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { KeyDIDProvider } from "@veramo/did-provider-key";
import { WebDIDProvider } from "@veramo/did-provider-web"
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as KeyDIDResolver } from "key-did-resolver";
import { getResolver as WebDIDResolver } from "web-did-resolver";
import { CredentialPlugin } from "@veramo/credential-w3c";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { CredentialIssuerLD, ICredentialIssuerLD} from "@veramo/credential-ld";


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
        defaultProvider: "did:key",
        providers: {
          "did:key": new KeyDIDProvider({
            defaultKms: "local",
          }),
          "did:web": new WebDIDProvider({
            defaultKms: 'local'
          })
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...KeyDIDResolver(),
          ...WebDIDResolver()
        }),
      }),
      new CredentialPlugin(),
      new CredentialIssuerLD({
        contextMaps: [],
        suites: []
      })
    ],
  });
};
