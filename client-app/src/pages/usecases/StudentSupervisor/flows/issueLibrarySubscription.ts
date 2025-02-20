import { IIdentifier, IKey, VerifiableCredential } from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const issueLibraryCredentialForSupervisor: (
  supervisorDIDIdentifier: IIdentifier,
  libraryDIDIdentifier: IIdentifier
) => Promise<VerifiableCredential> = async (
  supervisorDIDIdentifier: IIdentifier,
  libraryDIDIdentifier: IIdentifier
) => {
  const libraryKey: IKey | undefined = libraryDIDIdentifier.keys.at(0);

  if (!libraryKey) {
    throw new Error("Error in retrieving signing keys");
  }

  return await didWebAgent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: libraryDIDIdentifier.did,
      type: ["VerifiableCredential", "LibrarySubscriptionCredential"],
      credentialSubject: {
        id: supervisorDIDIdentifier.did,
        subscriptionType: "Premium",
        validUntil: "2025-12-31",
      },
      issuanceDate: new Date().toISOString(),
    },
    proofFormat: "jwt",
    keyRef: libraryKey.kid,
  });
};
