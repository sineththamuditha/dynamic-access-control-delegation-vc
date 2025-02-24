import { VerifiableCredential } from "@veramo/core";
import { ariesCloudAgentApiClient } from "../../../../../configs/axiosConfig";
import { VCStoreResponse } from "../../dtos/VCStoreResponse";
import { VCStoreRequest } from "../../dtos/VCStoreRequest";

export const storeCredentials = async (
  verifiableCredentials: VerifiableCredential[]
): Promise<string[]> => {
  const credentialIds: string[] = [];

  for (const verifiableCredential of verifiableCredentials) {
    const vcStoreRequest: VCStoreRequest = {
      options: {},
      verifiableCredential,
    };

    const vcResponse: VCStoreResponse = (
      await ariesCloudAgentApiClient.post<VCStoreResponse>(
        "/vc/credentials/store",
        vcStoreRequest
      )
    ).data;

    credentialIds.push(vcResponse.credentialId);
  }

  return credentialIds;
};
