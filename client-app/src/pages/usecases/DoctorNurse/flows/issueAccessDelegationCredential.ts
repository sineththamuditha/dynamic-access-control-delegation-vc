import {
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
} from "@veramo/core";
import { verifyPresentation } from "../apis/presentationClient/verifyPresentation";
import { createVerifiableCredential } from "../apis/credentialClient/credentialCreation";
import { CONFIG } from "../../../../constants";

export const issueAccessDelegationCredential: (
  verifiablePresentation: VerifiablePresentation,
  doctorDID: string,
  credentialId: string
) => Promise<VerifiableCredential> = async (
  verifiablePresentation: VerifiablePresentation,
  doctorDID: string,
  credentialId: string
) => {
  const verificationResponse = await verifyPresentation({
    verifiablePresentation,
    options: {
      challenge: verifiablePresentation.proof.challenge,
      proofPurpose: "authentication",
    },
  });

  if (!verificationResponse) {
    throw new Error("Hospital System: verifiable presentation is not valid");
  }

  const attributes: { [key: string]: any } = {};

  const verifiableCredentials: W3CVerifiableCredential[] | undefined =
    verifiablePresentation.verifiableCredential;

  if (!verifiableCredentials) {
    throw new Error("There are no verifiable credential");
  }

  const hospitalCredential: W3CVerifiableCredential | undefined =
    verifiableCredentials.find((credential: W3CVerifiableCredential) =>
      credential["type"].includes("HospitalCredential")
    );

  if (!hospitalCredential) {
    throw new Error("There are no hospital credentials present");
  }

  attributes["isHospitalEmployee"] = true;
  attributes["roleName"] = hospitalCredential["credentialSubject"]["roleName"];

  if (attributes["roleName"] === "Nurse") {
    attributes["licenseNumber"] =
      hospitalCredential["credentialSubject"]["licenseNumber"];
  }

  return await createVerifiableCredential({
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
      CONFIG.CREDENTIAL_DEFINITION_BASE_URL + "/definition-v1.jsonld",
    ],
    issuer: doctorDID,
    type: ["VerifiableCredential", "AccessDelegationCredentia;"],
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      attributes,
      credentialId,
      id: verifiablePresentation.holder,
      service: {
        type: "HttpEndpoint",
        serviceEndpoint: `${CONFIG.SERVICE_ENDPOINT_BASE_URL}/doctor/hospital-credential/get`,
      },
    },
  });
};
