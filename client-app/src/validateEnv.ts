
export const validateEnv = (): void => {
    const requiredEnvVars = [
      'REACT_APP_CLOUD_AGENT_API_URL', 
      'REACT_APP_CREDENTIAL_DEFINITION_BASE_URL',
      'REACT_APP_S3_BUCKET_REGION',
      'REACT_APP_S3_BUCKET_ACCESS_KEY',
      'REACT_APP_S3_BUCKET_SECRET_ACCESS_KEY',
      'REACT_APP_S3_BUCKET_BASE_URL',
      'REACT_APP_S3_BUCKET_NAME',
      'REACT_APP_WEB_DID_BASIC_URL',
      'REACT_APP_SERVICE_ENDPOINT_BASE_URL',
    ];
    
    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  
    if (missingVars.length > 0) {
      throw new Error(
        `The following environment variables are missing: ${missingVars.join(', ')}`
      );
    }
  };