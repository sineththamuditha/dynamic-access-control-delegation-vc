import { didWebAgent } from "../../../../agents/didWebAgent";


export const verifyVerifiablePresentation = async (
  verifiabllePresentationForLibrary: any
) => {
  console.log(verifiabllePresentationForLibrary);

  const verificationResult = await didWebAgent.verifyPresentation({
    presentation: verifiabllePresentationForLibrary,
    fetchRemoteContexts: false,
  });

  console.log(verificationResult);

  return verificationResult;
};
