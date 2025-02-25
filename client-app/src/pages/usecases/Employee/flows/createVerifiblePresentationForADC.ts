import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { didEthrAgent } from "../../../../agents/didEthrAgent";

export const createVerifiablePresentationToGetADC: (
  employeeIdentifier: IIdentifier,
  employeeCredential: VerifiableCredential
) => Promise<VerifiablePresentation> = async (
  employeeIdentifier: IIdentifier,
  employeeCredential: VerifiableCredential
) => {
  return await didEthrAgent.createVerifiablePresentation({
    presentation: {
      holder: employeeIdentifier.did,
      type: ["VerifiablePresentation"],
      verifiableCredential: [employeeCredential],
    },
    proofFormat: "jwt",
  });
};
