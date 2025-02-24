import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const createVerifiablePresentationToGetADC: (
  studentIdentifier: IIdentifier,
  studentUniversityCredential: VerifiableCredential
) => Promise<VerifiablePresentation> = async (
  studentIdentifier: IIdentifier,
  studentUniversityCredential: VerifiableCredential
) => {
  return await didWebAgent.createVerifiablePresentation({
    presentation: {
      holder: studentIdentifier.did,
      verifiableCredential: [studentUniversityCredential],
    },
    proofFormat: "jwt",
  });
};
