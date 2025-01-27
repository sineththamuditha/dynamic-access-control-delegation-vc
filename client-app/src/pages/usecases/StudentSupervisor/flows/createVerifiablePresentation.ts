import { studentAgent } from "../../../../agents/studentAgent";

export const createVerifiablePresentationForLibrary = async (
  studentDID: string,
  studentUniversityCredential: any,
  delegatedLibrarySubscription: any
) => {
  const verifiablePresentation =
    await studentAgent.createVerifiablePresentation({
      presentation: {
        holder: studentDID,
        verifiableCredential: [
          studentUniversityCredential,
          delegatedLibrarySubscription,
        ],
      },
      proofFormat: "jwt",
    });

  return verifiablePresentation;
};
