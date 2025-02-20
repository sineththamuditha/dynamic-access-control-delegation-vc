import { VerifiableCredential } from "@veramo/core";
import { CONFIG } from "../../../../constants";
import { createVerifiableCredential } from "../apis/credentialClient/credentialCreation";

export const delegateDoctorVerifiableCredential = async (
  subjectDID: string,
  issuerDID: string
): Promise<VerifiableCredential | null> => {

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
