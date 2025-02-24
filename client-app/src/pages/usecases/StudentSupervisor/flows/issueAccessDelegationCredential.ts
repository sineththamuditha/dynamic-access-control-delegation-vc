import {
  IIdentifier,
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";
import { CONFIG } from "../../../../constants";

export const issueAccessDelegationCredential: (
  vpForADC: VerifiablePresentation,
  supervisorIdentifier: IIdentifier,
  supervisorLibraryCredentialId: string
) => Promise<VerifiableCredential> = async (
  vpForADC: VerifiablePresentation,
  supervisorIdentifier: IIdentifier,
  supervisorLibraryCredentialId: string
) => {
  const verificationResult: IVerifyResult =
    await didWebAgent.verifyPresentation({
      presentation: vpForADC,
    });

  if (!verificationResult.verified) {
    throw new Error("Invalid verifiable presentation");
  }

  const attributes: { [key: string]: any } = {};

  const verifiableCredentials: W3CVerifiableCredential[] | undefined =
    vpForADC.verifiableCredential;

  if (!verifiableCredentials) {
    throw new Error("There are no verifiable credential");
  }

  const universityCredential: W3CVerifiableCredential | undefined =
    verifiableCredentials.find((credential: W3CVerifiableCredential) =>
      credential["type"].includes("UniversityCredential")
    );

  if (!universityCredential) {
    throw new Error("There are no university credentials present");
  }

  attributes["isUniversityStudent"] = true;
  attributes["studentId"] =
    universityCredential["credentialSubject"]["studentId"];
  attributes["isFromColomboUniversity"] =
    universityCredential["credentialSubject"]["university"] ===
    "University of Colombo";

  if (attributes["isFromColomboUniversity"] === false) {
    attributes["university"] =
      universityCredential["credentialSubject"]["university"];
  }

  return await didWebAgent.createVerifiableCredential({
    credential: {
      issuer: supervisorIdentifier.did,
      credentialSubject: {
        id: vpForADC.holder,
        credentialId: supervisorLibraryCredentialId,
        attributes,
        service: {
          type: "HttpEndpoint",
          serviceEndpoint: `${CONFIG.SERVICE_ENDPOINT_BASE_URL}/supervisor/library-credential/get`,
        },
      },
      type: ["VerifiableCredential", "AccessDelegationCredential"],
    },
    proofFormat: "jwt",
  });
};
