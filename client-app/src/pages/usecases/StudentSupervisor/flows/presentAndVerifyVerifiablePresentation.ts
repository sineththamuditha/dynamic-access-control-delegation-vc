import {
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";
import { credentialServerApiClient } from "../../../../configs/axiosConfig";

export const presentAndVerifyVerifiablePresentation: (
  verifiablePresentation: VerifiablePresentation
) => Promise<boolean> = async (
  verifiablePresentation: VerifiablePresentation
) => {
  const verificationResult: IVerifyResult =
    await didWebAgent.verifyPresentation({
      presentation: verifiablePresentation,
    }); 

  if (!verificationResult.verified) {
    throw new Error("Library System: verifiable presentation is nor valid");
  } 

  const verifiableCredentials: W3CVerifiableCredential[] | undefined =
    verifiablePresentation.verifiableCredential;

  if (!verifiableCredentials) {
    throw new Error(
      "Library System: there are no valid verifiable credentials present"
    );
  }

  const accessDelegationCredential: W3CVerifiableCredential | undefined =
    verifiableCredentials.find((credential) =>
      credential["type"].includes("AccessDelegationCredential")
    );

  if (!accessDelegationCredential) {
    throw new Error(
      "Library System: access delegation credential could not be found"
    );
  }

  const credentialRetrievalEndpoint: string =
    accessDelegationCredential["credentialSubject"]["service"][
      "serviceEndpoint"
    ];

  if (!credentialRetrievalEndpoint) {
    throw new Error(
      "Library System: credential retrieval enpoint is not specified"
    );
  } 

  try {
    const credentialRetrievalResponse =
      await credentialServerApiClient.post<VerifiableCredential>(
        "/supervisor/library-credential/get",
        accessDelegationCredential
      );

    const credentialeVerificationResult: IVerifyResult =
      await didWebAgent.verifyCredential({
        credential: credentialRetrievalResponse.data,
      });

    return credentialeVerificationResult.verified;
  } catch (error) {
    console.log(error);
    throw new Error("Library System: credential retrieval failed");
  }
};
