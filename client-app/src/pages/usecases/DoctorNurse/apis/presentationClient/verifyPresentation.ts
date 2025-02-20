import ariesCloudAgentApiClient from "../../../../../configs/axiosConfig";
import { VPVerificationResponse } from "../../dtos/VPVerificationResponse";
import { VPVerificationRequest } from "../../dtos/VPVerificationRequest";
import { AxiosError } from "axios";

export const verifyPresentation: (
  vpVerificationRequest: VPVerificationRequest
) => Promise<boolean> = async (
  vpVerificationRequest: VPVerificationRequest
) => {
  try {
    const apiResponse =
      await ariesCloudAgentApiClient.post<VPVerificationResponse>(
        "vc/presentations/verify",
        vpVerificationRequest
      );

    return apiResponse.data.verified;
  } catch (err: any) {
    const error = err as AxiosError;

    if (error.status === 500) {
      console.log("Internal error at cloud agent");
    }

    if (error.status === 400) {
        console.log(error);
    }
  }

  return false;
};
