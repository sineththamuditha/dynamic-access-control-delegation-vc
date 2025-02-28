import React, { useContext, useEffect, useState } from "react";
import JsonViewProvider from "../../../context/JsonViewContext";
import { JsonView } from "react-json-view-lite";
import { CONFIG, EvaluationResult } from "../../../constants";
import { DIDStore } from "../../../context/didStore";
import { Wallet } from "./models/wallet";
import { createWallet } from "./apis/walletClient/walletCreation";
import { retrieveWallet } from "./apis/walletClient/walletRetrieval";
import { LogContext } from "../../../context/LogContext";
import { PageContext } from "../../../context/PageContext";
import { Page } from "../../../enums/PageEnum";
import { storeCredentials } from "./apis/credentialClient/credentialStoring";
import { issueHospitalVerifiableCredentials } from "./flows/issueHospitalCredentials";
import { checkHealth } from "./apis/healthCheck";
import { checkCredentialServerHealth } from "../../../utils/protocolUtils";
import { VerifiableCredential, VerifiablePresentation } from "@veramo/core";
import { createVerifiablePresentationToGetADC } from "./flows/createVerifiablePresentationToGetADC";
import { fetchCredential } from "./apis/credentialClient/credentialFetch";
import { issueAccessDelegationCredential } from "./flows/issueAccessDelegationCredential";
import { createVerifiablePresentationWithADC } from "./flows/createVerifiablePresentationWithADC";
import { presentAndVerifyVerifiablePresentationForProtocol } from "./flows/PresentAndVerifyVerifiablePresentation";
import Papa from "papaparse";

const DoctorNurseProtocol: React.FC = () => {
  const [json, setJson] = useState<any>({});
  const { dids, addDID, hasDID } = useContext(DIDStore);
  const { addLog, clearLogs } = useContext(LogContext);
  const { setPage } = useContext(PageContext);
  const [storedCredentialIds, setStoredCredentialIds] = useState<{
    [key: string]: string;
  }>({});
  const [verifiablePresentations, setVerifiablePresentations] = useState<
    VerifiablePresentation[]
  >([]);

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

  const HOSPITAL_DID_KEY: string = "hospitalDID";
  const DOCTOR_DID_KEY: string = "doctorDID";
  const NURSE_DID_KEY: string = "nurseDID";

  const DOCTOR_HOSPITAL_CREDENTIAL_ID_KEY: string =
    "doctorHospitalCredentialId";
  const NURSE_HOSPITAL_CREDENTIAL_ID_KEY: string = "nurseHospitalCredentialId";
  const ACCESS_DELEGATION_CREDENTIAL_ID_KEY: string =
    "accessDelegationCredentialId";

  const VP_FOR_ADC: string = "vpForAdc";
  const VP_FOR_HOSPITAL_SYSTEM: string = "vpForHospitalSystem";

  const addStoredCredential: (key: string, credentialId: string) => void = (
    key: string,
    credentialId: string
  ) => {
    setStoredCredentialIds((prevStoredCredentialIds) => ({
      ...prevStoredCredentialIds,
      [key]: credentialId,
    }));
  };

  const goBackToMainPage = () => {
    setPage(Page.MAIN_PAGE);
  };

  useEffect(() => {
    checkHealth().then((active: boolean) => {
      if (!active) {
        throw new Error("Please make sure Aries Cloud Agent is running");
      }
    });

    checkCredentialServerHealth().then((active: boolean) => {
      if (!active) {
        throw new Error("Please make sure Credential Server is running");
      }
    });

    if (hasDID(HOSPITAL_DID_KEY)) {
      retrieveWallet(dids[HOSPITAL_DID_KEY]).then((hospitalWallet) => {
        addDID(HOSPITAL_DID_KEY, hospitalWallet.did);
      });
    } else {
      createWallet().then((nullableHospitalWallet) => {
        const hospitalWallet: Wallet = nullableHospitalWallet as Wallet;
        addDID(HOSPITAL_DID_KEY, hospitalWallet.did);
      });
    }

    if (hasDID(DOCTOR_DID_KEY)) {
      retrieveWallet(dids[DOCTOR_DID_KEY]).then((doctorWallet) => {
        addDID(DOCTOR_DID_KEY, doctorWallet.did);
      });
    } else {
      createWallet().then((nullableDoctorWallet) => {
        const doctorWallet: Wallet = nullableDoctorWallet as Wallet;
        addDID(DOCTOR_DID_KEY, doctorWallet.did);
      });
    }

    if (hasDID(NURSE_DID_KEY)) {
      retrieveWallet(dids[NURSE_DID_KEY]).then((nurseWallet) => {
        addDID(NURSE_DID_KEY, nurseWallet.did);
      });
    } else {
      createWallet().then((nullableNurseWallet) => {
        const nurseWallet: Wallet = nullableNurseWallet as Wallet;
        addDID(NURSE_DID_KEY, nurseWallet.did);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const issueCredentials: () => Promise<void> = async () => {
    const { doctorVC, nurseVC } = await issueHospitalVerifiableCredentials(
      dids[HOSPITAL_DID_KEY],
      dids[DOCTOR_DID_KEY],
      dids[NURSE_DID_KEY]
    );

    const storedIds: string[] = await storeCredentials([doctorVC, nurseVC]);

    addStoredCredential(DOCTOR_HOSPITAL_CREDENTIAL_ID_KEY, storedIds[0]);
    addStoredCredential(NURSE_HOSPITAL_CREDENTIAL_ID_KEY, storedIds[1]);

    setJson({
      doctorHospitalVC: doctorVC,
      nurseHospitalVC: nurseVC,
    });

    addLog("Hospital credentials for doctor and nurse issued");
  };

  const createVerifiablePresentationForADC: () => Promise<void> = async () => {
    const verifiablePresentation: VerifiablePresentation =
      await createVerifiablePresentationToGetADC(
        dids[NURSE_DID_KEY],
        await fetchCredential(
          storedCredentialIds[NURSE_HOSPITAL_CREDENTIAL_ID_KEY]
        )
      );

    setJson(verifiablePresentation);

    setVerifiablePresentations((prevVps) => ({
      ...prevVps,
      [VP_FOR_ADC]: verifiablePresentation,
    }));

    addLog("Verifiable presentation to get ADC is created");
  };

  const delegateAccessUsingADC: () => Promise<void> = async () => {
    const adc: VerifiableCredential = await issueAccessDelegationCredential(
      verifiablePresentations[VP_FOR_ADC],
      dids[DOCTOR_DID_KEY],
      storedCredentialIds[DOCTOR_HOSPITAL_CREDENTIAL_ID_KEY]
    );

    const storedIds: string[] = await storeCredentials([adc]);

    addStoredCredential(ACCESS_DELEGATION_CREDENTIAL_ID_KEY, storedIds[0]);

    setJson(adc);

    addLog("Access delegation credential created");
  };

  const createVerifiablePresentationForHospitalSystem: () => Promise<void> =
    async () => {
      const verifiablePresentation: VerifiablePresentation =
        await createVerifiablePresentationWithADC(dids[NURSE_DID_KEY], [
          await fetchCredential(
            storedCredentialIds[ACCESS_DELEGATION_CREDENTIAL_ID_KEY]
          ),
          await fetchCredential(
            storedCredentialIds[NURSE_HOSPITAL_CREDENTIAL_ID_KEY]
          ),
        ]);

      setVerifiablePresentations((prevVps) => ({
        ...prevVps,
        [VP_FOR_HOSPITAL_SYSTEM]: verifiablePresentation,
      }));

      setJson(verifiablePresentation);

      addLog("Verifiable presentation for hospital system is created");
    };

  const presentVerifiablePresentation: () => Promise<void> = async () => {
    const verificationResult: boolean =
      await presentAndVerifyVerifiablePresentationForProtocol(
        verifiablePresentations[VP_FOR_HOSPITAL_SYSTEM]
      );

    if (!verificationResult) {
      throw new Error(
        "Hospital System: verifiable presentation is invalid or did not contain enough claims"
      );
    }

    addLog(`Hospital System: verification result is -> ${verificationResult}`);
  };

  const evaluate: () => Promise<void> = async () => {
    const { doctorVC, nurseVC } = await issueHospitalVerifiableCredentials(
      dids[HOSPITAL_DID_KEY],
      dids[DOCTOR_DID_KEY],
      dids[NURSE_DID_KEY]
    );

    const credentialIds: string[] = await storeCredentials([doctorVC, nurseVC]);

    const verifiablePresentationForADC: VerifiablePresentation =
      await createVerifiablePresentationToGetADC(dids[NURSE_DID_KEY], nurseVC);

    for (let i = 0; i <= 100; i++) {
      const delegationStart: DOMHighResTimeStamp = performance.now();

      const adc: VerifiableCredential = await issueAccessDelegationCredential(
        verifiablePresentationForADC,
        dids[DOCTOR_DID_KEY],
        credentialIds[0]
      );

      const delegationEnd: DOMHighResTimeStamp = performance.now();

      const adcId: string[] = await storeCredentials([adc]);

      const verifiablePresentation: VerifiablePresentation =
        await createVerifiablePresentationWithADC(dids[NURSE_DID_KEY], [
          await fetchCredential(adcId[0]),
          nurseVC,
        ]);

      const verificationStart: DOMHighResTimeStamp = performance.now();

      const verificationResult: boolean =
        await presentAndVerifyVerifiablePresentationForProtocol(verifiablePresentation);

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
        "Total Time Taken":
          delegationEnd -
          delegationStart +
          (verificationEnd - verificationStart),
      });
    }

    const csvData = Papa.unparse(evaluationResults);

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "doctorNurseProtocol.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <JsonViewProvider>
      <div className="upper">
        <div className="left-section">
          <button onClick={issueCredentials}>Issue Credentials</button>
          <button onClick={createVerifiablePresentationForADC}>
            Create Verifiable Presentation to Get Access Delegation Credential
          </button>
          <button onClick={delegateAccessUsingADC}>
            Delegate Access Using ADC
          </button>
          <button onClick={createVerifiablePresentationForHospitalSystem}>
            Create Verifiable Presentation
          </button>
          <button onClick={presentVerifiablePresentation}>
            Present Credentials
          </button>
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

export default DoctorNurseProtocol;
