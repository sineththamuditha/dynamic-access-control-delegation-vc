import { setupAgent } from "../configs/didConfig";

export const libraryAgent = setupAgent('library')

export const getLibraryDID = async () => {
    const identifier = await libraryAgent.didManagerGetOrCreate({
        provider: 'did:web',
        alias: 'library',
        options: {
            domain: 'library.example.org'
        }
    });

    console.log('Library DID', (await identifier).did);
    return identifier.did;
}