import { VerifiablePresentation } from "@veramo/core";

export interface DIDCommMessageToRetrieveCompanyCredential {
    id: string
    type: string;
    from: string;
    to: string[];
    body: VerifiablePresentation
}