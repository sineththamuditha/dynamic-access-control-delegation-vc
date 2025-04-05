import { IIdentifier } from "@veramo/core";
import { setupAgent } from "../configs/didConfig";

export const didKeyAgent = setupAgent()

export const getKeyDid: (name: string, keyType: string) => Promise<IIdentifier> = async (name: string, keyType: string) => {

    const identifier: IIdentifier = await didKeyAgent.didManagerGetOrCreate({
        provider: 'did:key',
        alias: name,
        options: {
            keyType
        }
    })
    
    return identifier;
}