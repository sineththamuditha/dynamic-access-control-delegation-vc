import { libraryAgent } from "../../../../agents/libraryAgent";

export const verifyVerifiablePresentation = async (verifiabllePresentationForLibrary: any) => {

    const verificationResult = await libraryAgent.verifyPresentation({
        presentation: verifiabllePresentationForLibrary,
        fetchRemoteContexts: false
    });

    console.log(verificationResult);

    return verificationResult;
};
