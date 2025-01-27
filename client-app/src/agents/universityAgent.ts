import { setupAgent } from "../configs/didConfig";

export const universityAgent = setupAgent('university')

export const getUniversityDID = async () => {
    const identifier = await universityAgent.didManagerGetOrCreate({
        provider: 'did:web',
        alias: 'university',
        options: {
            domain: 'university.example.org'
        }
    });

    console.log('University DID', (await identifier).did);
    return identifier.did;
}