import { DIDDocument } from "did-resolver";
import { IIdentifier, IKey} from "@veramo/core";
import { createDIDDocument } from "../../../../utils/didDocumentUtils";
import { didWebAgent } from "../../../../agents/didWebAgent";
import { uploadDidDocument } from "../apis/uploadDidDocument";

export const delegateUsingDIDDocument: (
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => Promise<DIDDocument> = async (
  supervisorIdentifier: IIdentifier,
  studentIdentifier: IIdentifier
) => {

  const studentKey: IKey | undefined = studentIdentifier.keys.at(0);
  const supervisorKey: IKey | undefined = supervisorIdentifier.keys.at(0);
  
  if (!studentKey || !supervisorKey) {
    throw new Error("Error in retrieving signing keys");
  }

  await didWebAgent.didManagerAddKey({
    did: supervisorIdentifier.did,
    key: {
      kid: studentKey.kid,
      kms: studentKey.kms,
      type: studentKey.type,
      publicKeyHex: studentKey.publicKeyHex
    }
  })

  const didDocument: DIDDocument = createDIDDocument(
    supervisorIdentifier.did,
    {
      [supervisorIdentifier.did]: supervisorKey,
      [studentIdentifier.did]: studentKey
    }
  )

  await uploadDidDocument(
    "supervisor",
    didDocument
  )

  return didDocument;
};
