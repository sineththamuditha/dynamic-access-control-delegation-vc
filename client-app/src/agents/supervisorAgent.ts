import { setupAgent } from "../configs/didConfig";

// Setting up the student agent by calling setupAgent
export const supervisorAgent = setupAgent('supervisot');

// Function to create a DID for the student.
// This will generate a DID and return it, representing the student in the Veramo ecosystem.
export const getSupervisorDID = async () => {
  const identifier = await supervisorAgent.didManagerGetOrCreate({
     provider: 'did:web',
     alias: 'supervisor'
     }); // Create a DID using did:web
  console.log('Supervisor DID:', identifier.did); // Print the generated DID
  return identifier.did; // Return the DID for further use
};