import { IKey, IService } from "@veramo/core";
import { DIDDocument, VerificationMethod } from "did-resolver";

export const createDIDDocument: (
  id: string,
  keys: { [key: string]: IKey }
) => DIDDocument = (id: string, keys: { [key: string]: IKey }) => {
  const verificationMethods: VerificationMethod[] = [];
  const authentications: string[] = [];
  const assertionMethods: string[] = [];

  for (const key in keys) {
    const val = keys[key];

    verificationMethods.push({
      id: `${key}#key-1`,
      type: "EcdsaSecp256k1VerificationKey2019",
      controller: key,
      publicKeyHex: val.publicKeyHex,
    });

    authentications.push(`${key}#key-1`);
    assertionMethods.push(`${key}#key-1`);
  }

  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    id,
    verificationMethod: verificationMethods,
    authentication: authentications,
    assertionMethod: assertionMethods,
  };
};

export const createDIDDocumentWithService = (
  id: string,
  keys: { [key: string]: IKey },
  service: IService
) => {
  const verificationMethods: VerificationMethod[] = [];
  const authentications: string[] = [];
  const assertionMethods: string[] = [];

  for (const key in keys) {
    const val = keys[key];

    verificationMethods.push({
      id: `${key}#key-1`,
      type: "EcdsaSecp256k1VerificationKey2019",
      controller: key,
      publicKeyHex: val.publicKeyHex,
    });

    authentications.push(`${key}#key-1`);
    assertionMethods.push(`${key}#key-1`);
  }

  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    id,
    verificationMethod: verificationMethods,
    authentication: authentications,
    assertionMethod: assertionMethods,
    service: [service],
  };
};
