import {
  VerifiablePresentation,
} from "@veramo/core";
import { didEthrAgent } from "../../../../agents/didEthrAgent";
import { credentialServerApiClient } from "../../../../configs/axiosConfig";
import { IDIDCommMessage, IPackedDIDCommMessage } from "@veramo/did-comm";
import { Dispatch } from "react";

export const presentAndVerifyVerifiablePresentation: (
  verifiablePresentation: VerifiablePresentation,
  setJson: Dispatch<any>
) => Promise<boolean> = async (
  verifiablePresentation: VerifiablePresentation,
  setJson: Dispatch<any>
) => {
  const companyDID: string = (
    await credentialServerApiClient.get<{ companyDID: string }>("/company/did")
  ).data.companyDID;

  const message: IDIDCommMessage = {
    id: crypto.randomUUID(),
    type: "Company Credential request",
    from: verifiablePresentation.holder,
    to: [companyDID],
    body: verifiablePresentation,
  };

  const packedMessage: IPackedDIDCommMessage =
    await didEthrAgent.packDIDCommMessage({
      packing: "jws",
      message,
    });

  const response = (
    await credentialServerApiClient.post<IPackedDIDCommMessage>(
      "/company/company-credential/get",
      packedMessage
    )
  ).data;

  const unpackedResponse = await didEthrAgent.unpackDIDCommMessage(response);

  if (unpackedResponse.message.body) {
    setJson(unpackedResponse.message.body);
    return true;
  }

  return false;
};
