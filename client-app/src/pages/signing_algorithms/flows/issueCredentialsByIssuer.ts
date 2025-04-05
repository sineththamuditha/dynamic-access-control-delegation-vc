import { IIdentifier, VerifiableCredential } from "@veramo/core";
import { didKeyAgent } from "../../../agents/didKeyAgent";

export const issueCrednetialsByIssuer: (
  issueIdentifier: IIdentifier,
  delegateeIdentifier: IIdentifier,
  delegatorIdentifier: string,
  keyType: string
) => Promise<{
  delegateeCredential: VerifiableCredential;
  delegatorCredential: VerifiableCredential;
}> = async (
  issuerIdentifier: IIdentifier,
  delegateeIdentifier: IIdentifier,
  delegatorIdentifier: string,
  keyType: string
) => {
  return {
    delegateeCredential: await didKeyAgent.createVerifiableCredential({
      credential: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        issuer: issuerIdentifier.did,
        type: ["VerifiableCredential", "PerformanceCredential"],
        credentialSubject: {
          id: delegateeIdentifier.did,
          keyType
        },
        issuanceDate: new Date().toISOString(),
        id: "urn:uuid:" +  crypto.randomUUID(),
      },
      proofFormat: "jwt",
    }),
    delegatorCredential: await didKeyAgent.createVerifiableCredential({
      credential: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        issuer: issuerIdentifier.did,
        type: ["VerifiableCredential", "PerformanceCredential"],
        credentialSubject: {
          id: delegatorIdentifier,
          keyType
        },
        issuanceDate: new Date().toISOString(),
        id: "urn:uuid:" +  crypto.randomUUID(),
      },
      proofFormat: "jwt",
    }),
  };
};
