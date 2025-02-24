import axios, { AxiosError } from "axios";
import { ariesCloudAgentApiClient } from "../../../../../configs/axiosConfig";
import { WalletCreationRequest } from "../../dtos/WalletCreationRequest";
import { WalletCreationResponse } from "../../dtos/WalletCreationResponse";
import { Wallet } from "../../models/wallet";

export const createWallet = async (): Promise<Wallet | null> => {
  const walletCreationRequest: WalletCreationRequest = {
    method: "key",
    options: {
      key_type: "ed25519",
    },
  };

  try {
    const response =
      await ariesCloudAgentApiClient.post<WalletCreationResponse>(
        "/wallet/did/create",
        walletCreationRequest
      );

    return response.data.result;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const error = err as AxiosError;

      if (error.status === 500) {
        console.log("Internal error at cloud agent");
      }
    }

    return null;
  }
};
