import {
  universityAgent,
  getUniversityDID,
} from "../../../../agents/universityAgent";

export const issueUniversityCredentials = async (studentDID: string, supervisorDID: string) => {

  const uninversityDID = await getUniversityDID();

  const studentUniversityCredential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: uninversityDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: studentDID,
      studentId: "S001",
      university: "Example University",
    },
  };

  const signedStudentVC = await universityAgent.createVerifiableCredential({
    credential: studentUniversityCredential,
    proofFormat: "jwt",
  });

  const supervisorUniversityCredential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: uninversityDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: supervisorDID,
      lecturerId: "L025",
      university: "Example University",
    },
  };

  const signedSupervisorVC = await universityAgent.createVerifiableCredential({
    credential: supervisorUniversityCredential,
    proofFormat: 'jwt'
  })

  return { signedSupervisorVC, signedStudentVC };
};
