import {
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { credentialServerApiClient } from "../../../../configs/axiosConfig";

export const issueAccessDelegationCredential: (
  vpForADC: VerifiablePresentation
) => Promise<VerifiableCredential> = async (
  vpForADC: VerifiablePresentation
) => {
  
    try {
        return (await credentialServerApiClient.post<VerifiableCredential>('/adc', vpForADC)).data

    } catch (error) {
        console.log(error)
        throw new Error('Access delegation credential retrieval failed');
    }
};
