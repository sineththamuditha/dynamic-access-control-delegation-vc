import { supervisorAgent } from "../../../../agents/supervisorAgent";

export const delegateLibrarySubscription = async (
  supervisorDID: string,
  studentDID: string,
  supervisorLibraryVC: any
) => {
  const delegatedLibraryPresentation =
    await supervisorAgent.createVerifiablePresentation({
      presentation: {
        holder: supervisorDID,
        verifiableCredential: supervisorLibraryVC
      },
      proofFormat: "jwt",
    });

  return delegatedLibraryPresentation;
};
