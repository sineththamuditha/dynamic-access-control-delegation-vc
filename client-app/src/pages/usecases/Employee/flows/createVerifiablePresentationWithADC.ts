import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { didEthrAgent } from "../../../../agents/didEthrAgent";

export const createVerifiablePresenationWithADC: (
  adc: VerifiableCredential,
  employeeIdentifier: IIdentifier
) => Promise<VerifiablePresentation> = async (
  adc: VerifiableCredential,
  employeeIdentifier: IIdentifier
) => {
  return await didEthrAgent.createVerifiablePresentation({
    presentation: {
      holder: employeeIdentifier.did,
      verifiableCredential: [adc],
    },
    proofFormat: "jwt",
  });
};
