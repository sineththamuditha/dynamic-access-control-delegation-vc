import React, { useContext, useEffect, useState } from "react";
import JsonViewProvider from "../../../context/JsonViewContext";
import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { LogContext } from "../../../context/LogContext";
import { PageContext } from "../../../context/PageContext";
import { Page } from "../../../enums/PageEnum";
import { JsonView } from "react-json-view-lite";
import { CONFIG } from "../../../constants";
import { getEthrDid } from "../../../agents/didEthrAgent";
import { issueCredentialsForEmployeeAndCompany } from "./flows/issueCredentialsForEmployeeAndCompany";
import { createVerifiablePresentationToGetADC } from "./flows/createVerifiblePresentationForADC";
import { issueAccessDelegationCredential } from "./flows/issueAccessDelegationCredential";
import { createVerifiablePresenationWithADC } from "./flows/createVerifiablePresentationWithADC";
import { checkCredentialServerHealth } from "../../../utils/protocolUtils";
import { presentAndVerifyVerifiablePresentation } from "./flows/presentAndVerifyVerifiablePresentation";

const EmployeeProtocol: React.FC = () => {
  const [didIdentifiers, setDIDIdentifiers] = useState<{
    [key: string]: IIdentifier;
  }>({});
  const [storedVCs, setStoredVcs] = useState<{
    [key: string]: VerifiableCredential;
  }>({});
  const [verifiablePresentations, setVerifiablePresentations] = useState<{
    [key: string]: VerifiablePresentation;
  }>({});
  const { addLog, clearLogs } = useContext(LogContext);
  const [json, setJson] = useState<any>({});
  const { setPage } = useContext(PageContext);

  const EMPLOYEE_KEY: string = "employee";

  const EMPLOYEE_DID_IDENTIFIER_KEY: string = "employeeDIDIdentifier";

  const COMPANY_VC_KEY: string = "companyVC";
  const EMPLOYEE_VC_KEY: string = "employeeVC";
  const ADC_VC_KEY: string = "adcVC";

  const VP_FOR_ADC: string = "vpForADC";
  const VP_FOR_RESOURCE: string = "vpForResource";

  useEffect(() => {
    checkCredentialServerHealth().then((active: boolean) => {
      if (!active) {
        throw new Error("Please make sure Credential Server is running");
      }
    });

    getEthrDid(EMPLOYEE_KEY).then((employeeIdentifier: IIdentifier) => {
      setDIDIdentifiers((prevDidIdentifiers) => ({
        ...prevDidIdentifiers,
        [EMPLOYEE_DID_IDENTIFIER_KEY]: employeeIdentifier,
      }));
    });
  }, []);

  const goBackToMainPage = () => {
    setPage(Page.MAIN_PAGE);
  };

  const issueCredentials: () => Promise<void> = async () => {
    const employeeCredential = await issueCredentialsForEmployeeAndCompany(
      didIdentifiers[EMPLOYEE_DID_IDENTIFIER_KEY]
    );

    setStoredVcs((prevVcs) => ({
      ...prevVcs,
      [EMPLOYEE_VC_KEY]: employeeCredential,
    }));

    setJson(employeeCredential);

    addLog("Credentials for compant and employee is issued");
  };

  const createVerifiablePresentationForADC: () => Promise<void> = async () => {
    const verifiablePresentation: VerifiablePresentation =
      await createVerifiablePresentationToGetADC(
        didIdentifiers[EMPLOYEE_DID_IDENTIFIER_KEY],
        storedVCs[EMPLOYEE_VC_KEY]
      );

    setJson(verifiablePresentation);

    setVerifiablePresentations((prevVps) => ({
      ...prevVps,
      [VP_FOR_ADC]: verifiablePresentation,
    }));

    addLog("Verifiable presenatation to get ADC is created");
  };

  const delegateAccess: () => Promise<void> = async () => {
    const adc: VerifiableCredential = await issueAccessDelegationCredential(
      verifiablePresentations[VP_FOR_ADC]
    );

    setStoredVcs((prevVcs) => ({
      ...prevVcs,
      [ADC_VC_KEY]: adc,
    }));

    setJson(adc);

    addLog("Access delegation credential is issued");
  };

  const createVerifiablePresentationForResource: () => Promise<void> =
    async () => {
      const vpWithADC: VerifiablePresentation =
        await createVerifiablePresenationWithADC(
          storedVCs[ADC_VC_KEY],
          didIdentifiers[EMPLOYEE_DID_IDENTIFIER_KEY]
        );

      setVerifiablePresentations((prevVps) => ({
        ...prevVps,
        [VP_FOR_RESOURCE]: vpWithADC,
      }));

      setJson(vpWithADC);

      addLog("VerifiablePresentation for resource is created");
    };

  const presentVerifiablePresentation: () => Promise<void> = async () => {
    const verificationResult: boolean =
      await presentAndVerifyVerifiablePresentation(
        verifiablePresentations[VP_FOR_RESOURCE],
        setJson
      );

    if (!verificationResult) {
      throw new Error("Credential retrieval failed");
    }

    addLog(`Credential retrieval process success: ${verificationResult}`);
  };

  return (
    <JsonViewProvider>
      <div className="upper">
        <div className="left-section">
          <button onClick={issueCredentials}>
            Issue Employee & Company Credential
          </button>
          <button onClick={createVerifiablePresentationForADC}>
            Create Verifiable Presentation to Get Access Delegation Credential
          </button>
          <button onClick={delegateAccess}>
            Delegate Access Using Access Delegation Credential
          </button>
          <button onClick={createVerifiablePresentationForResource}>
            Create Verifiable Presentation
          </button>
          <button onClick={presentVerifiablePresentation}>
            Present Verifiable Presentation
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

export default EmployeeProtocol;
