import { CredentialSubject } from "@veramo/core";

export interface Credential {
    "@context": string[],
    credentialSubject: CredentialSubject
}