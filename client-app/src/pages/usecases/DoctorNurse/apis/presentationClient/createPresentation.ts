import { VerifiablePresentation } from "@veramo/core";
import { VPCreationRequest } from "../../dtos/VPCreationRequest";
import { ariesCloudAgentApiClient } from "../../../../../configs/axiosConfig";
import { VPCreationResponse } from "../../dtos/VPCreationResponse";
import axios, { AxiosError } from "axios";

export const createPresentation = async (
  vpCreationRequest: VPCreationRequest
): Promise<VerifiablePresentation | undefined> => {
  try {
    const apiResponse = await ariesCloudAgentApiClient.post<VPCreationResponse>(
      "vc/presentations/prove",
      vpCreationRequest
    );

    return apiResponse.data.verifiablePresentation;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const error = err as AxiosError;

      if (error.status === 500) {
        console.log("Internal error at cloud agent");
      }
    }

    return undefined;
  }
};
