import { CredentialPayload, VerifiableCredential } from "@veramo/core";
import ariesCloudAgentApiClient from "../../../../../configs/axiosConfig";
import { VCIssueResponse } from "../../dtos/VCIssueResponse";
import { VCIssueRequest } from "../../dtos/VCIssueRequest";

export const createVerifiableCredential: (credential: CredentialPayload) => Promise<VerifiableCredential> = async (credential: CredentialPayload): Promise<VerifiableCredential> => {

    const doctorVCRequest: VCIssueRequest = {
        credential,
        options: {}
    }

    const response = await ariesCloudAgentApiClient.post<VCIssueResponse>("/vc/credentials/issue", doctorVCRequest);

    return response.data.verifiableCredential;
}