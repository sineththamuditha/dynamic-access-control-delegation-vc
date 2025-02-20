import { VerifiablePresentation } from "@veramo/core";
import { VPVerificationRequest } from "../dtos/VPVerificationRequest";
import { verifyPresentation } from "../apis/presentationClient/verifyPresentation";

export const presentAndVerifyVerifiablePresentation: (vp: VerifiablePresentation) => Promise<boolean> = async (vp: VerifiablePresentation) => {

    const vpVerificationRequest: VPVerificationRequest = {
        options : {
            challenge: vp.proof.challenge,
            proofPurpose: "authentication"
        },
        verifiablePresentation: vp
    }

    return await verifyPresentation(vpVerificationRequest);
}