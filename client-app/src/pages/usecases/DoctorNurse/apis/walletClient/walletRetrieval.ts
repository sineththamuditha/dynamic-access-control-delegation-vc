import ariesCloudAgentApiClient from "../../../../../configs/axiosConfig";
import { WalletRetrievalResponse } from "../../dtos/WalletRetrievalResponse";
import { Wallet } from "../../models/wallet";
import { createWallet } from "./walletCreation";

export const retrieveWallet = async (did: string): Promise<Wallet> => {
  const response = await ariesCloudAgentApiClient.get<WalletRetrievalResponse>(
    "/wallet/did",
    { params: { did } }
  );

  const wallets: Wallet[] = response.data.results

  if (wallets.length > 0) {
    return wallets[0]
  } else {
    const newWallet = await createWallet();

    return newWallet as Wallet;
  }
};
