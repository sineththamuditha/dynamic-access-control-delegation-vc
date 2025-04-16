import axios from "axios";
import { CONFIG } from "../constants";

export const ariesCloudAgentApiClient = axios.create({
  baseURL: CONFIG.CLOUD_AGENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const credentialServerApiClient = axios.create({
  baseURL: CONFIG.SERVICE_ENDPOINT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const flaskServerApiClient = axios.create({
  baseURL: CONFIG.FLASK_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})
