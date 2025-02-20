import { IIdentifier, IKey, VerifiableCredential } from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const issueUniversityCredentialsForSupervisorAndStudent: (
  universityIdentifier: IIdentifier,
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => Promise<{
  signedSupervisorVC: VerifiableCredential;
  signedStudentVC: VerifiableCredential;
}> = async (
  universityIdentifier: IIdentifier,
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => {
  // getting the key to sign student & supervisor university credentials
  const universityKey: IKey | undefined = universityIdentifier.keys.at(0);

  if (!universityKey) {
    throw new Error("Error in retrieving signing keys");
  }

  return {
    signedSupervisorVC: await didWebAgent.createVerifiableCredential({
      credential: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", "UniversityCredential"],
        issuer: universityIdentifier.did,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: supervisorIdentifier.did,
          lecturerId: "L025",
          university: "University of Colombo",
        },
      },
      proofFormat: "jwt",
      keyRef: universityKey.kid,
    }),
    signedStudentVC: await didWebAgent.createVerifiableCredential({
      credential: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", "UniversityCredential"],
        issuer: universityIdentifier.did,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: studentIdentifier.did,
          studentId: "S001",
          university: "University of Colombo",
        },
      },
      proofFormat: "jwt",
      keyRef: universityKey.kid,
    }),
  };
};
