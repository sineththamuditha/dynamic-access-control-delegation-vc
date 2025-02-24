import { VerifiableCredential, VerifiablePresentation } from "@veramo/core";
import { createPresentation } from "../apis/presentationClient/createPresentation";

export const createVerifiablePresentationWithADC: (
  nurseDID: string,
  verifiableCredential: VerifiableCredential[]
) => Promise<VerifiablePresentation> = async (
  nurseDID: string,
  verifiableCredential: VerifiableCredential[]
) => {
  const verifiablePresentation: VerifiablePresentation | undefined =
    await createPresentation({
      presentation: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        holder: nurseDID,
        verifiableCredential,
      },
      options: {
        proofPurpose: "authentication",
        challenge: crypto.randomUUID(),
      },
    });

  if (!verifiablePresentation) {
    throw new Error(
      "Hospital System: could not create verifiable presentation"
    );
  }

  return verifiablePresentation;
};
