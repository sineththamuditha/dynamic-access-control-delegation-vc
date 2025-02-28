import { VerifiableCredential, VerifiablePresentation } from "@veramo/core";
import { CONFIG } from "../../../../constants";
import { createVerifiableCredential } from "../apis/credentialClient/credentialCreation";
import { verifyPresentation } from "../apis/presentationClient/verifyPresentation";

export const delegateDoctorVerifiableCredential = async (
  verifiablePresentation: VerifiablePresentation,
  subjectDID: string,
  issuerDID: string
): Promise<VerifiableCredential | null> => {

  const verificationResult: boolean = await verifyPresentation({
      options: {
        challenge: verifiablePresentation.proof.challenge,
        proofPurpose: "authentication",
      },
      verifiablePresentation: verifiablePresentation,
    });
  
    if (!verificationResult) {
      throw new Error("Hospital System: verifiable presentation is not valid");
    }

  return await createVerifiableCredential({
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
      CONFIG.CREDENTIAL_DEFINITION_BASE_URL + "/definition-v1.jsonld",
    ],
    issuer: issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: subjectDID,
      name: "Dr. John Doe",
      roleName: "Surgeon",
      speciality: "Cardiac Surgery",
      licenseNumber: "SURG7891011",
    },
    id: "urn:uuid:" +  crypto.randomUUID(),
    type: ["VerifiableCredential"],
  });
};
