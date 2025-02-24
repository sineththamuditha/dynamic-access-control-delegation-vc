import { credentialServerApiClient } from "../configs/axiosConfig";

export const checkCredentialServerHealth: () => Promise<boolean> = async () => {
  try {
    const healthCheckResponse = await credentialServerApiClient.get<{
      alive: boolean;
    }>("/health");

    return healthCheckResponse.data.alive;
  } catch (error) {
    console.log(error);
    return false;
  }
};
