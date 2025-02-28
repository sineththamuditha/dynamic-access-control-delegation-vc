export interface VCVerificationResponse {
  verified: boolean
  results: {
    verified: boolean;
    [key: string]: any;
  };
}
