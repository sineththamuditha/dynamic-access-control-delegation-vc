import { IIdentifier } from "@veramo/core";
import { setupAgent } from "../configs/didConfig";
import { CONFIG } from "../constants";
import { createDIDDocument } from "../utils/didDocumentUtils";
import { uploadDidDocument } from "../pages/usecases/StudentSupervisor/apis/uploadDidDocument";

export const didWebAgent = setupAgent("didWeb");

export const getDidFor: (name: string) => Promise<IIdentifier> = async (name: string) => {
  const identifier = await didWebAgent.didManagerGetOrCreate({
    provider: "did:web",
    alias: `${CONFIG.WEB_DID_BASIC_URL}:${name}`,
  });

  const keyOfTheUser = identifier.keys.at(0);

  keyOfTheUser &&
    uploadDidDocument(
      "university",
      createDIDDocument(identifier.did, {
        [identifier.did]: keyOfTheUser,
      })
    );

    return identifier;
};
