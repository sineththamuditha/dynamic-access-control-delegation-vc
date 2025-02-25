import { IIdentifier } from "@veramo/core";
import { setupAgent } from "../configs/didConfig";

export const didEthrAgent = setupAgent()

export const getEthrDid: (name: string) => Promise<IIdentifier> = async (name: string) => {

    const identifier: IIdentifier = await didEthrAgent.didManagerGetOrCreate({
        provider: 'did:ethr',
        alias: name
    })

    console.log(identifier)
    
    return identifier;
}