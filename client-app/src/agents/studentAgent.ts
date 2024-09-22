import { setupAgent } from "../configs/didConfig";

// Setting up the student agent by calling setupAgent
export const studentAgent = setupAgent('student');

// Function to create a DID for the student.
// This will generate a DID and return it, representing the student in the Veramo ecosystem.
export const getStudentDID = async () => {
  const identifier = await studentAgent.didManagerGetOrCreate({
     provider: 'did:web',
     alias: 'university student'
     }); // Create a DID using did:web
  console.log('Student DID:', identifier.did); // Print the generated DID
  return identifier.did; // Return the DID for further use
};