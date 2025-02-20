import { VerifiablePresentation } from "@veramo/core";

export interface VPVerificationRequest {
    options: {
        challenge: string;
        proofPurpose: string;
    },
    verifiablePresentation: VerifiablePresentation;
}