import React, { useContext, useEffect, useState } from "react";
import { LogContext } from "../../../context/LogContext";
import { issueUniversityCredentialsForSupervisorAndStudent } from "./flows/issueUniversityCredentials";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { issueLibraryCredentialForSupervisor } from "./flows/issueLibrarySubscription";
import { delegateUsingDIDDocument } from "./flows/delegateUsingDIDDocument";
import { createVerifiablePresentationForLibrary } from "./flows/createVerifiablePresentation";
import { verifyVerifiablePresentation } from "./flows/verifyVerifiablePresentation";
import JsonViewProvider from "../../../context/JsonViewContext";
import { PageContext } from "../../../context/PageContext";
import { Page } from "../../../enums/PageEnum";
import { CONFIG } from "../../../constants";
import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { getDidFor } from "../../../agents/didWebAgent";

const StudentSupervisor: React.FC = () => {
  const [didIdentifiers, setDIDIdentifiers] = useState<{
    [key: string]: IIdentifier;
  }>({});
  const [storedVCs, setStoredVcs] = useState<{
    [key: string]: VerifiableCredential;
  }>({});
  const [verifiablePresentation, setVerifiablePresentation] =
    useState<VerifiablePresentation>();
  const { addLog, clearLogs } = useContext(LogContext);
  const [json, setJson] = useState<any>({});
  const { setPage } = useContext(PageContext);

  const STUDENT: string = "student";
  const SUPERVISOR: string = "supervisor";
  const UNIVERSITY: string = "university";
  const LIBRARY: string = "library";

  const STUDENT_DID_IDENTIFIER_KEY: string = "studentDIDIdentifier";
  const SUPERVISOR_DID_IDENTIFIER_KEY: string = "supervisorDIDIdentifier";
  const UNIVERSITY_DID_IDENTIFIER_KEY: string = "universityDIDIdentifier";
  const LIBRARY_DID_IDENTIFIER_KEY: string = "libraryDIDIdentifier";

  const STUDENT_UNIVERSITY_VC_KEY: string = "studentUniversityVCKey";
  const SUPERVISOR_UNIVERSITY_VC_KEY: string = "supervisorUniversityVCKey";
  const SUPERVISOR_LIBRARY_VC_KEY: string = "supervisorLibraryVCKey";

  useEffect(() => {
    getDidFor(SUPERVISOR).then((supervisorDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [SUPERVISOR_DID_IDENTIFIER_KEY]: supervisorDID,
      }));
    });

    getDidFor(STUDENT).then((studentDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [STUDENT_DID_IDENTIFIER_KEY]: studentDID,
      }));
    });

    getDidFor(UNIVERSITY).then((universityDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [UNIVERSITY_DID_IDENTIFIER_KEY]: universityDID,
      }));
    });

    getDidFor(LIBRARY).then((libraryDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [LIBRARY_DID_IDENTIFIER_KEY]: libraryDID,
      }));
    });
  }, []);

  const goBackToMainPage = () => {
    setPage(Page.MAIN_PAGE);
  };

  const issueUniversityCredentials = async () => {
    const { signedSupervisorVC, signedStudentVC } =
      await issueUniversityCredentialsForSupervisorAndStudent(
        didIdentifiers[UNIVERSITY_DID_IDENTIFIER_KEY],
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY]
      );

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      [SUPERVISOR_UNIVERSITY_VC_KEY]: signedSupervisorVC,
      [STUDENT_UNIVERSITY_VC_KEY]: signedStudentVC,
    }));

    setJson({
      [SUPERVISOR_UNIVERSITY_VC_KEY]: signedSupervisorVC,
      [STUDENT_UNIVERSITY_VC_KEY]: signedStudentVC,
    });

    addLog(
      "University credentials for supervisor and the student has been granted"
    );
  };

  const issueLibraryCredential = async () => {
    const supervisorLibraryCredential =
      await issueLibraryCredentialForSupervisor(
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        didIdentifiers[LIBRARY_DID_IDENTIFIER_KEY]
      );

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      [SUPERVISOR_LIBRARY_VC_KEY]: supervisorLibraryCredential,
    }));

    setJson(supervisorLibraryCredential);

    addLog("Library subscription credentials for supervisor has been granted");
  };

  const delegateAccessUsingDIDDocument = async () => {
    setJson(
      await delegateUsingDIDDocument(
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY]
      )
    );

    addLog("Access for did document of the supervisor is delegated to student");
  };

  const createVerifiablePresentation = async () => {
    const libraryVerifiablePresentation: VerifiablePresentation =
      await createVerifiablePresentationForLibrary(
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        storedVCs[SUPERVISOR_LIBRARY_VC_KEY]
      );

    setVerifiablePresentation(libraryVerifiablePresentation);

    setJson(libraryVerifiablePresentation);

    addLog("Library verifiable presentation created");
  };

  const verifyVerifiablePresentationForLibrary = async () => {
    addLog("Verifying library verifiable presentation...");

    setJson(await verifyVerifiablePresentation(verifiablePresentation));

    addLog(
      "Verifible presentation verification results is present at the console"
    );
  };

  return (
    <JsonViewProvider>
      <div className="upper">
        <div className="left-section">
          <button onClick={async () => await issueUniversityCredentials()}>
            Issue University Credentials For Supervisor And Student
          </button>
          <button onClick={async () => await issueLibraryCredential()}>
            Issue Library Credential For Supervisor
          </button>
          <button onClick={async () => await delegateAccessUsingDIDDocument()}>
            Delegate Access Using DID Document
          </button>
          <button onClick={async () => await createVerifiablePresentation()}>
            Create Verifiable Presentation
          </button>
          <button
            onClick={async () => await verifyVerifiablePresentationForLibrary()}
          >
            Present credentials
          </button>
          <button onClick={clearLogs}>Clear Terminal</button>
          <button onClick={goBackToMainPage}>Go Back To Main Page</button>
        </div>

        <div className="right-section">
          <JsonView
            data={json}
            clickToExpandNode
            style={CONFIG.JSON_VIEW_STYLE_PROPS}
          />
        </div>
      </div>
    </JsonViewProvider>
  );
};

export default StudentSupervisor;
