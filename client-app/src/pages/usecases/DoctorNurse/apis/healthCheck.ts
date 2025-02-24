import { ariesCloudAgentApiClient } from "../../../../configs/axiosConfig";

export const checkHealth: () => Promise<boolean> = async () => {
  try {
    const healthCheckResponse = await ariesCloudAgentApiClient.get<{
      alive: boolean;
    }>("/status/live");

    return healthCheckResponse.data.alive;
  } catch (error) {
    console.log(error);
    return false;
  }
};
