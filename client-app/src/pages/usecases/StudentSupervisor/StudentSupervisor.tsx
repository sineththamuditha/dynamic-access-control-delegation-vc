import React, { useContext, useEffect, useState } from "react";
import { LogContext } from "../../../context/LogContext";
import { issueUniversityCredentials } from "./flows/issueUniversityCredentials";
import { JsonView, allExpanded, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import { getStudentDID } from "../../../agents/studentAgent";
import { getSupervisorDID } from "../../../agents/supervisorAgent";
import { issueLibrarySubscription } from "./flows/issueLibrarySubscription";
import { delegateLibrarySubscription } from "./flows/delegateLibrarySubscription";
import { createVerifiablePresentationForLibrary } from "./flows/createVerifiablePresentation";
import { verifyVerifiablePresentation } from "./flows/verifyVerifiablePresentation";

const StudentSupervisor: React.FC = () => {
  const [dids, setDID] = useState<{ [key: string]: string }>({});
  const [storedVCs, setStoredVcs] = useState<{ [key: string]: any }>([]);
  const { addLog, clearLogs } = useContext(LogContext);

  useEffect(() => {
    getStudentDID().then((studentDID) => {
      setDID((prevJsonObject) => ({
        ...prevJsonObject,
        studentDID: studentDID,
      }));
    });

    getSupervisorDID().then((supervisorDID) => {
      setDID((prevJsonObject) => ({
        ...prevJsonObject,
        supervisorDID: supervisorDID,
      }));
    });
  }, []);

  const issueCredential = async () => {
    const { signedSupervisorVC, signedStudentVC } =
      await issueUniversityCredentials(
        dids["studentDID"],
        dids["supervisorDID"]
      );
    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      supervisorUniversityVC: signedSupervisorVC,
      studentUniversityVC: signedStudentVC,
    }));
    addLog(
      "University credentials for supervisor and the student has been granted"
    );

    const { signedLibraryVC } = await issueLibrarySubscription(
      dids["supervisorDID"]
    );

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      supervisorLibraryVC: signedLibraryVC,
    }));

    addLog("Library subscription for the supervisor has been granted");
  };

  const delegateLibraryCredential = async () => {
    const delegatedPresentation = await delegateLibrarySubscription(
      dids["supervisorDID"],
      dids["studentDID"],
      storedVCs["supervisorLibraryVC"]
    );

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      delegatedLibraryPresentation: delegatedPresentation,
    }));

    addLog("Library subscription delegated");
  };

  const createVerifiablePresentation = async () => {
    const verifiablePresentation = await createVerifiablePresentationForLibrary(
      dids["studentDID"],
      storedVCs["studentUniversityVC"],
      storedVCs["delegatedLibraryPresentation"]
    );

    console.log(verifiablePresentation);

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      libraryVerifiablePresentation: verifiablePresentation,
    }));

    addLog("Verifiable Presentation for the library has been created ....");
  };

  const verifyVerifiablePresentationForLibrary = async (
    verifiablePresentation: any
  ) => {
    const verificationResult = await verifyVerifiablePresentation(
      verifiablePresentation
    );

    // addLog(verificationResult)
  };

  return (
    <div>
      <button onClick={async () => await issueCredential()}>
        Issue credentials
      </button>
      <button onClick={async () => await delegateLibraryCredential()}>
        Delegate library credential
      </button>
      <button onClick={async () => await createVerifiablePresentation()}>
        Create verifiable presentation
      </button>
      <button
        onClick={async () =>
          await verifyVerifiablePresentationForLibrary(
            storedVCs["libraryVerifiablePresentation"]
          )
        }
      >
        Present credentials
      </button>
      <button onClick={clearLogs}>Clear Terminal</button>
      <JsonView
        data={storedVCs[storedVCs.length - 1]}
        shouldExpandNode={allExpanded}
        style={darkStyles}
      />
    </div>
  );
};

export default StudentSupervisor;
