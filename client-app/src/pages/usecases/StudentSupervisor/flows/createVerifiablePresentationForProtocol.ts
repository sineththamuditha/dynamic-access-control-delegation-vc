import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";

export const createVerifiablePresentationWithADC: (
  studentIdentifier: IIdentifier,
  verifiableCredentials: VerifiableCredential[]
) => Promise<VerifiablePresentation> = async (
  studentIdentifier: IIdentifier,
  verifiableCredentials: VerifiableCredential[]
) => {

    return await didWebAgent.createVerifiablePresentation({
        presentation: {
            holder: studentIdentifier.did,
            verifiableCredential: verifiableCredentials
        },
        proofFormat: 'jwt'
    })
};
