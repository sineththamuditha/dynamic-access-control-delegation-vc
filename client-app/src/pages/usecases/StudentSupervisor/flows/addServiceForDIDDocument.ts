import { IIdentifier, IKey, IService } from "@veramo/core";
import { didWebAgent } from "../../../../agents/didWebAgent";
import { CONFIG } from "../../../../constants";
import { uploadDidDocument } from "../apis/uploadDidDocument";
import { createDIDDocumentWithService } from "../../../../utils/didDocumentUtils";

export const addDocumentForDIDDocument = (
  supervisorIdentifier: IIdentifier
) => {
  const supervisorKey: IKey | undefined = supervisorIdentifier.keys.at(0);

  if (!supervisorKey) {
    throw new Error("Error in retrieving signing keys");
  }

  const service: IService = {
    id: `${supervisorIdentifier.did}#CredentialRetrieval`,
    type: 'HttpEndpoint',
    serviceEndpoint: `${CONFIG.SERVICE_ENDPOINT_BASE_URL}/supervisor/library-credential/get`,
  };

  didWebAgent.didManagerAddService({
    did: supervisorIdentifier.did,
    service,
  });

  uploadDidDocument(
    `protocol/supervisor`,
    createDIDDocumentWithService(
      supervisorIdentifier.did,
      { [supervisorIdentifier.did]: supervisorKey },
      service
    )
  );
};
