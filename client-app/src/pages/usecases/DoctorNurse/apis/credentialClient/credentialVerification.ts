import { VerifiableCredential } from "@veramo/core";
import { VCVerificationResponse } from "../../dtos/VCVerificationResponse";
import { ariesCloudAgentApiClient } from "../../../../../configs/axiosConfig";
import { VCVerificationRequest } from "../../dtos/VCVerificationRequest";

export const verifyCredential: (
  vc: VerifiableCredential
) => Promise<boolean> = async (vc: VerifiableCredential) => {
  const vcVerificationRequest: VCVerificationRequest = {
    verifiableCredential: vc,
    options: {},
  };

  const verificationResponse: VCVerificationResponse = (
    await ariesCloudAgentApiClient.post<VCVerificationResponse>(
      "/vc/credentials/verify",
      vcVerificationRequest
    )
  ).data;

  return verificationResponse.results.verified;
};
