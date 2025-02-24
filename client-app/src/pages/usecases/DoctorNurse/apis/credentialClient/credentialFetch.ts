import { VerifiableCredential } from "@veramo/core";
import {ariesCloudAgentApiClient} from "../../../../../configs/axiosConfig";

export const fetchCredential: (credentialId: string) => Promise<VerifiableCredential> =  async (credentialId: string) => {

    const vcFetchResponse = await ariesCloudAgentApiClient.get<VerifiableCredential>(`/vc/credentials/${credentialId}`);

    return vcFetchResponse.data;
}