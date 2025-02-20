import { VerifiableCredential } from "@veramo/core";

export interface VPCreationRequest {
    presentation: {
        "@context": string[];
        type: string[];
        holder: string;
        verifiableCredential: VerifiableCredential[];
    },
    options: {
        proofPurpose: string;
        challenge: string;
    }
}