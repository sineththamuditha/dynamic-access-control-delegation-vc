import { VerifiableCredential, VerifiablePresentation, W3CVerifiableCredential } from "@veramo/core";
import { verifyPresentation } from "../apis/presentationClient/verifyPresentation";
import { credentialServerApiClient } from "../../../../configs/axiosConfig";
import { verifyCredential } from "../apis/credentialClient/credentialVerification";

export const presentAndVerifyVerifiablePresentation: (
  vp: VerifiablePresentation
) => Promise<boolean> = async (vp: VerifiablePresentation) => {
  return await verifyPresentation({
    options: {
      challenge: vp.proof.challenge,
      proofPurpose: "authentication",
    },
    verifiablePresentation: vp,
  });
};

export const presentAndVerifyVerifiablePresentationForProtocol: (
  vp: VerifiablePresentation
) => Promise<boolean> = async (vp: VerifiablePresentation) => {
  const verificationResult: boolean = await verifyPresentation({
    options: {
      challenge: vp.proof.challenge,
      proofPurpose: "authentication",
    },
    verifiablePresentation: vp,
  });

  if (!verificationResult) {
    throw new Error("Hospital System: verifiable presentation is not valid");
  }

  const verifiableCredentials: W3CVerifiableCredential[] | undefined =
    vp.verifiableCredential;

  if (!verifiableCredentials) {
    throw new Error(
      "Hospital System: there are no valid verifiable credentials present"
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
          "/doctor/hospital-credential/get",
          accessDelegationCredential
        );
  
      const credentialeVerificationResult: boolean = await verifyCredential(credentialRetrievalResponse.data);
        
  
      return credentialeVerificationResult;
    } catch (error) {
      console.log(error);
      throw new Error("Library System: credential retrieval failed");
    }
};
