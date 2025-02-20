import { IIdentifier, IKey, VerifiableCredential } from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const createVerifiablePresentationForLibrary = async (
  supervisorDIDIdentifier: IIdentifier,
  librarySubscriptionCredential: VerifiableCredential
) => {

  const delegatedStudentKey: IKey | undefined = supervisorDIDIdentifier.keys.at(1);
  
  if (!delegatedStudentKey) {
    throw new Error("Error in retrieving signing keys");
  }

  const verifiablePresentation =
    await didWebAgent.createVerifiablePresentation({
      presentation: {
        holder: supervisorDIDIdentifier.did,
        verifiableCredential: [
          librarySubscriptionCredential,
        ],
      },
      proofFormat: "jwt",
      keyRef: delegatedStudentKey.kid
    });

  return verifiablePresentation;
};
