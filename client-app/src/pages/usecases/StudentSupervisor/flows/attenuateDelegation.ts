import {
  IIdentifier,
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const attenuatedDelegation: (
  vpForADC: VerifiablePresentation,
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => Promise<VerifiableCredential> = async (
  vpForADC: VerifiablePresentation,
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => {
  const verificationResult: IVerifyResult =
    await didWebAgent.verifyPresentation({
      presentation: vpForADC,
    });

  if (!verificationResult.verified) {
    throw new Error("Invalid verifiable presentation");
  }

  return didWebAgent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: supervisorIdentifier.did,
      type: ["VerifiableCredential", "LibrarySubscriptionCredential"],
      credentialSubject: {
        id: studentIdentifier.did,
        subscriptionType: "Premium",
        validUntil: "2025-12-31",
      },
      issuanceDate: new Date().toISOString(),
    },
    proofFormat: "jwt",
  });
};
