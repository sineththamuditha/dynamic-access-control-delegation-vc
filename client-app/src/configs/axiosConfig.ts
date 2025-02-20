import axios from "axios";
import { CONFIG } from "../constants";

const ariesCloudAgentApiClient = axios.create({
  baseURL: CONFIG.CLOUD_AGENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default ariesCloudAgentApiClient;
