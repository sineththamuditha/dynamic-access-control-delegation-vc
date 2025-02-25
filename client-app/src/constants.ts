import { darkStyles } from "react-json-view-lite";
import { StyleProps } from "react-json-view-lite/dist/DataRenderer";

interface EnvConfig {
    CLOUD_AGENT_API_URL: string;
    CREDENTIAL_DEFINITION_BASE_URL: string;
    JSON_VIEW_STYLE_PROPS: StyleProps;
    S3_BUCKET_CONFIG: {
        region: string;
        credentials: {
            accessKeyId: string;
            secretAccessKey: string;
        }
    };
    S3_BUCKET_BASE_URL: string;
    S3_BUCKET_NAME: string;
    WEB_DID_BASIC_URL: string;
    SERVICE_ENDPOINT_BASE_URL: string;
    INFURA_PROJECT_ID: string
}

export const CONFIG : EnvConfig = {
    CLOUD_AGENT_API_URL: process.env.REACT_APP_CLOUD_AGENT_API_URL || "",
    CREDENTIAL_DEFINITION_BASE_URL: process.env.REACT_APP_CREDENTIAL_DEFINITION_BASE_URL || "",
    JSON_VIEW_STYLE_PROPS: {
        ...darkStyles,
        "stringValue": "json-view-str-val",
        "container": "_GzYRV json-view"
    },
    S3_BUCKET_CONFIG: {
        region: process.env.REACT_APP_S3_BUCKET_REGION || "",
        credentials: {
            accessKeyId: process.env.REACT_APP_S3_BUCKET_ACCESS_KEY || "",
            secretAccessKey: process.env.REACT_APP_S3_BUCKET_SECRET_ACCESS_KEY || ""
        }
    },
    S3_BUCKET_BASE_URL: process.env.REACT_APP_S3_BUCKET_BASE_URL || "",
    S3_BUCKET_NAME: process.env.REACT_APP_S3_BUCKET_NAME || "",
    WEB_DID_BASIC_URL: process.env.REACT_APP_WEB_DID_BASIC_URL || "",
    SERVICE_ENDPOINT_BASE_URL: process.env.REACT_APP_SERVICE_ENDPOINT_BASE_URL || "",
    INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID || "",
}