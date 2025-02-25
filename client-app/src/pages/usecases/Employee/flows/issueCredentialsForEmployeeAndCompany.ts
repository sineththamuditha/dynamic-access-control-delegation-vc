import { IIdentifier, VerifiableCredential } from "@veramo/core";
import { credentialServerApiClient } from "../../../../configs/axiosConfig";

export const issueCredentialsForEmployeeAndCompany: (
  employeeIdentifier: IIdentifier
) => Promise<VerifiableCredential> = async (
  employeeIdentifier: IIdentifier
) => {
  try {
    return (
      await credentialServerApiClient.get<VerifiableCredential>(
        `/credentials/${employeeIdentifier.did}`
      )
    ).data;
  } catch (error) {
    console.log(error);
    throw new Error("Employee credential creation failed");
  }
};
