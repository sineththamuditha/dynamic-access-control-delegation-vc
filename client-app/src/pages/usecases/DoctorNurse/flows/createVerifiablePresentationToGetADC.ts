import { VerifiableCredential, VerifiablePresentation } from "@veramo/core";
import { createPresentation } from "../apis/presentationClient/createPresentation";

export const createVerifiablePresentationToGetADC: (
  nurseDID: string,
  nurseHospitalCredential: VerifiableCredential
) => Promise<VerifiablePresentation> = async (
  nurseDID: string,
  nurseHospitalCredential: VerifiableCredential
) => {
  const verifiablePresentation: VerifiablePresentation | undefined =
    await createPresentation({
      presentation: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        holder: nurseDID,
        verifiableCredential: [nurseHospitalCredential],
      },
      options: {
        proofPurpose: "authentication",
        challenge: crypto.randomUUID(),
      },
    });

  if (!verifiablePresentation) {
    throw new Error("Failed to create verifiable presentation for ADC");
  }

  return verifiablePresentation;
};
