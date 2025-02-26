import React, { useContext, useEffect, useState } from "react";
import JsonViewProvider from "../../../context/JsonViewContext";
import { JsonView } from "react-json-view-lite";
import { CONFIG, EvaluationResult } from "../../../constants";
import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { getDidProtocolFor } from "../../../agents/didWebAgent";
import { issueUniversityCredentialsForSupervisorAndStudent } from "./flows/issueUniversityCredentials";
import { issueLibraryCredentialForSupervisor } from "./flows/issueLibrarySubscription";
import { createVerifiablePresentationToGetADC } from "./flows/createVerifiablePresentationToGetADC";
import { issueAccessDelegationCredential } from "./flows/issueAccessDelegationCredential";
import { createVerifiablePresentationWithADC } from "./flows/createVerifiablePresentationForProtocol";
import { credentialServerApiClient } from "../../../configs/axiosConfig";
import { presentAndVerifyVerifiablePresentation } from "./flows/presentAndVerifyVerifiablePresentation";
import { LogContext } from "../../../context/LogContext";
import { PageContext } from "../../../context/PageContext";
import { Page } from "../../../enums/PageEnum";
import { checkCredentialServerHealth } from "../../../utils/protocolUtils";
import Papa from "papaparse";

const StudentSupervisorProtocol: React.FC = () => {
  const [json, setJson] = useState<any>({});
  const [didIdentifiers, setDIDIdentifiers] = useState<{
    [key: string]: IIdentifier;
  }>({});
  const [storedVCs, setStoredVcs] = useState<{
    [key: string]: VerifiableCredential;
  }>({});
  const [verifiablePresentations, setVerifiablePresentations] = useState<
    VerifiablePresentation[]
  >([]);
  const { setPage } = useContext(PageContext);
  const { addLog, clearLogs } = useContext(LogContext);

  const [evaluationResults, setEvaluationResults] = useState<
    EvaluationResult[]
  >([]);

  const addEvaluationResult: (evaluationResult: EvaluationResult) => void = (
    evaluationResult: EvaluationResult
  ) => {
    const evaluationResultArray = evaluationResults;

    evaluationResultArray.push(evaluationResult);
    setEvaluationResults(evaluationResultArray);
  };

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
  const STUDENT_ADC_VC_KEY: string = "studentADCKey";

  const VP_FOR_ADC_KEY: string = "vpForADC";
  const VP_FOR_LIBRARY: string = "vpForLibrary";

  useEffect(() => {
    checkCredentialServerHealth().then((active: boolean) => {
      if (!active) {
        throw new Error("Please make sure Credential Server is running");
      }
    });

    getDidProtocolFor(STUDENT).then((studentDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [STUDENT_DID_IDENTIFIER_KEY]: studentDID,
      }));
    });

    getDidProtocolFor(SUPERVISOR).then((supervisorDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [SUPERVISOR_DID_IDENTIFIER_KEY]: supervisorDID,
      }));
    });

    getDidProtocolFor(UNIVERSITY).then((universityDID: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [UNIVERSITY_DID_IDENTIFIER_KEY]: universityDID,
      }));
    });

    getDidProtocolFor(LIBRARY).then((libraryDID: IIdentifier) => {
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

    try {
      await credentialServerApiClient.post<{ message: string }>(
        "/supervisor/library-credential/set",
        supervisorLibraryCredential
      );
    } catch (error) {
      console.log(error);
      throw new Error("Credential uploading failed");
    }

    addLog("Library subscription credentials for supervisor has been granted");
  };

  const createVerifiablePresentationForADC = async () => {
    const vpForADC: VerifiablePresentation =
      await createVerifiablePresentationToGetADC(
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY],
        storedVCs[STUDENT_UNIVERSITY_VC_KEY]
      );

    setVerifiablePresentations((prevPresentations) => ({
      ...prevPresentations,
      [VP_FOR_ADC_KEY]: vpForADC,
    }));

    setJson(vpForADC);
  };

  const delegateAccessUsingADC: () => Promise<void> = async () => {
    const adc: VerifiableCredential = await issueAccessDelegationCredential(
      verifiablePresentations[VP_FOR_ADC_KEY],
      didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
      storedVCs[SUPERVISOR_LIBRARY_VC_KEY].id as string
    );

    setStoredVcs((prevVCs) => ({
      ...prevVCs,
      [STUDENT_ADC_VC_KEY]: adc,
    }));

    setJson(adc);
  };

  const createVPForLibrarySystem: () => Promise<void> = async () => {
    const vpForLibrary: VerifiablePresentation =
      await createVerifiablePresentationWithADC(
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY],
        [storedVCs[STUDENT_ADC_VC_KEY], storedVCs[STUDENT_UNIVERSITY_VC_KEY]]
      );

    setVerifiablePresentations((prevPresentations) => ({
      ...prevPresentations,
      [VP_FOR_LIBRARY]: vpForLibrary,
    }));

    setJson(vpForLibrary);
  };

  const presentCredentials: () => Promise<void> = async () => {
    const verificationResult: boolean =
      await presentAndVerifyVerifiablePresentation(
        verifiablePresentations[VP_FOR_LIBRARY]
      );

    if (!verificationResult) {
      throw new Error("Library Sytem: could not verify student credentials");
    }

    addLog(`Library System: verification result is -> ${verificationResult}`);
  };

  const evaluate: () => Promise<void> = async () => {
    const { signedStudentVC } =
      await issueUniversityCredentialsForSupervisorAndStudent(
        didIdentifiers[UNIVERSITY_DID_IDENTIFIER_KEY],
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY]
      );

    const supervisorLibraryCredential =
      await issueLibraryCredentialForSupervisor(
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        didIdentifiers[LIBRARY_DID_IDENTIFIER_KEY]
      );

    try {
      await credentialServerApiClient.post<{ message: string }>(
        "/supervisor/library-credential/set",
        supervisorLibraryCredential
      );
    } catch (error) {
      console.log(error);
      throw new Error("Credential uploading failed");
    }

    const vpForADC: VerifiablePresentation =
      await createVerifiablePresentationToGetADC(
        didIdentifiers[STUDENT_DID_IDENTIFIER_KEY],
        signedStudentVC
      );

    for (let i = 0; i <= 10; i++) {
      const delegationStart: DOMHighResTimeStamp = performance.now();

      const adc: VerifiableCredential = await issueAccessDelegationCredential(
        vpForADC,
        didIdentifiers[SUPERVISOR_DID_IDENTIFIER_KEY],
        supervisorLibraryCredential.id as string
      );

      const delegationEnd: DOMHighResTimeStamp = performance.now();

      const vpForLibrary: VerifiablePresentation =
        await createVerifiablePresentationWithADC(
          didIdentifiers[STUDENT_DID_IDENTIFIER_KEY],
          [adc, signedStudentVC]
        );

      const verificationStart: DOMHighResTimeStamp = performance.now();

      const verificationResult: boolean =
        await presentAndVerifyVerifiablePresentation(vpForLibrary);

      const verificationEnd: DOMHighResTimeStamp = performance.now();

      addLog(`Verification Result for ${i} attempt: ${verificationResult}`);

      addEvaluationResult({
        Iteration: i,
        "Delagation Start": delegationStart,
        "Delegation End": delegationEnd,
        "Delegation Time Taken": delegationEnd - delegationStart,
        "Verification Start": verificationStart,
        "Verification End": verificationEnd,
        "Verification Time Taken": verificationEnd - verificationStart,
      });
    }

    const csvData = Papa.unparse(evaluationResults);

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "supervisorStudentProtocol.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <JsonViewProvider>
      <div className="upper">
        <div className="left-section">
          <button onClick={issueUniversityCredentials}>
            Issue University Credentials For Supervisor And Student
          </button>
          <button onClick={issueLibraryCredential}>
            Issue Library Credential For Supervisor
          </button>
          <button onClick={createVerifiablePresentationForADC}>
            Create Verifiable Presentation to Get Access Delegation Credential
          </button>
          <button onClick={delegateAccessUsingADC}>
            Delegate Access Using ADC
          </button>
          <button onClick={createVPForLibrarySystem}>
            Create Verifiable Presentation
          </button>
          <button onClick={presentCredentials}>Present credentials</button>
          <button onClick={evaluate}>Evaluate</button>
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

export default StudentSupervisorProtocol;
