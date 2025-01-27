import { libraryAgent, getLibraryDID } from "../../../../agents/libraryAgent";

export const issueLibrarySubscription = async (supervisorDID: string) => {
  const libraryDID: string = await getLibraryDID();

  const libraryCrdential = {
    issuer: libraryDID,
    type: ["VerifiableCredential", "LibrarySubscriptionCredential"],
    credentialSubject: {
      id: supervisorDID,
      subscriptionType: "Premium",
      validUntil: "2025-12-31",
    },
  };

  const signedLibraryCredential = await libraryAgent.createVerifiableCredential(
    {
      credential: libraryCrdential,
      proofFormat: "jwt",
    }
  );

  console.log("Library credential ", signedLibraryCredential);

  return signedLibraryCredential;
};
