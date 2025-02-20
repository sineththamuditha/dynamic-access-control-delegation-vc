import { CredentialPayload, VerifiableCredential } from "@veramo/core";
import { createVerifiableCredential } from "../apis/credentialClient/credentialCreation";
import { CONFIG } from "../../../../constants";

export const issueHospitalVerifiableCredentials = async (
  hospitalDID: string,
  doctorDID: string,
  nurseDID: string
) : Promise<{doctorVC: VerifiableCredential, nurseVC: VerifiableCredential}> => { 

  return { 
    doctorVC: await createVerifiableCredential({
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
        CONFIG.CREDENTIAL_DEFINITION_BASE_URL + "/definition-v1.jsonld"
      ],
      issuer: hospitalDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: doctorDID,
        name: "Dr. John Doe",
        roleName: "Surgeon",
        speciality: "Cardiac Surgery",
        licenseNumber: "SURG7891011",
      },
      id: "urn:uuid:" +  crypto.randomUUID(),
      type: ["VerifiableCredential"],
    }), 
    nurseVC: await createVerifiableCredential({
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
        CONFIG.CREDENTIAL_DEFINITION_BASE_URL + "/definition-v1.jsonld"
      ],
      issuer: hospitalDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: nurseDID,
        name: "Miss Jane Doe",
        roleName: "Nurse",
        licenseNumber: "NURSE8945345",
      },
      id: "urn:uuid:" +  crypto.randomUUID(),
      type: ["VerifiableCredential"],
    })
  };
};
