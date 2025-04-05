import { useContext, useEffect, useState } from "react";
import JsonViewProvider from "../../context/JsonViewContext";
import { PageContext } from "../../context/PageContext";
import { Page } from "../../enums/PageEnum";
import { LogContext } from "../../context/LogContext";
import { JsonView } from "react-json-view-lite";
import {
  CONFIG,
  EvaluationResult,
  KeyTypeEvaluationResult,
} from "../../constants";
import {
  IIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import React from "react";
import Papa from "papaparse";
import { didKeyAgent, getKeyDid } from "../../agents/didKeyAgent";
import { issueCrednetialsByIssuer } from "./flows/issueCredentialsByIssuer";
import { credentialServerApiClient } from "../../configs/axiosConfig";
import { AxiosResponse } from "axios";

interface ED25519Props {
  keyType: "Ed25519" | "Secp256k1";
}

interface DelegationResponse {
  accessDelegationCredential: VerifiableCredential;
  timeTaken: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface VerificationResponse {
  delegatedCredential: VerifiableCredential;
  verification: {
    timeTaken: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  retrieval: {
    timeTaken: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

const AlgorithmProtocolImplementation: React.FC<ED25519Props> = ({
  keyType,
}) => {
  const { setPage } = useContext(PageContext);
  const [json, setJson] = useState<any>({});
  const { addLog, clearLogs } = useContext(LogContext);

  const [didIdentifiers, setDidIdentifiers] = useState<{
    [key: string]: IIdentifier;
  }>({});
  const [issuedCredential, setIssuedCredentials] = useState<{
    [key: string]: VerifiableCredential;
  }>({});

  const DELEGATEE_IDENTIFIER_KEY = `delegatee_${keyType}`;
  const DELEGATOR_IDENTIFIER_KEY = `delegator_${keyType}`;
  const ISSUER_IDENTIFIER_KEY = `issuer_${keyType}`;

  const DELEGATEE_CREDENTIAL_KEY = "delegateeCredential";
  const ACCESS_DELEGATION_CREDENTIAL_KEY = "accessDelegationCredential";

  const [evaluationResults, setEvaluationResults] = useState<
    KeyTypeEvaluationResult[]
  >([]);

  const addEvaluationResult: (
    evaluationResult: KeyTypeEvaluationResult
  ) => void = (evaluationResult: KeyTypeEvaluationResult) => {
    const evaluationResultArray = evaluationResults;

    evaluationResultArray.push(evaluationResult);
    setEvaluationResults(evaluationResultArray);
  };

  const addIssuedCredential: (
    credential: VerifiableCredential,
    credentialKey: string
  ) => void = (credential: VerifiableCredential, credentialKey: string) => {
    setIssuedCredentials((preCredentials) => ({
      ...preCredentials,
      [credentialKey]: credential,
    }));
  };

  const addIdentifier: (
    identifier: IIdentifier,
    identifierKey: string
  ) => void = (identifier: IIdentifier, identifierKey: string) => {
    setDidIdentifiers((prevIdentifiers) => ({
      ...prevIdentifiers,
      [identifierKey]: identifier,
    }));
  };

  const goBackToMainPage = () => {
    setPage(Page.MAIN_PAGE);
  };

  useEffect(() => {
    getKeyDid(DELEGATEE_IDENTIFIER_KEY, keyType).then(
      (identifier: IIdentifier) => {
        addIdentifier(identifier, DELEGATEE_IDENTIFIER_KEY);
      }
    );
    getKeyDid(DELEGATOR_IDENTIFIER_KEY, keyType).then(
      (identifier: IIdentifier) => {
        addIdentifier(identifier, DELEGATOR_IDENTIFIER_KEY);
      }
    );
    getKeyDid(ISSUER_IDENTIFIER_KEY, keyType).then(
      (identifier: IIdentifier) => {
        addIdentifier(identifier, ISSUER_IDENTIFIER_KEY);
      }
    );
  }, []);

  const issueCredential: () => Promise<void> = async () => {
    try {
      const response: AxiosResponse<{ delegatorIdentifier: string }> =
        await credentialServerApiClient.post<{ delegatorIdentifier: string }>(
          "/initialize-delegator",
          {
            keyType,
          }
        );

      console.log(didIdentifiers[ISSUER_IDENTIFIER_KEY]);

      const { delegateeCredential, delegatorCredential } =
        await issueCrednetialsByIssuer(
          didIdentifiers[ISSUER_IDENTIFIER_KEY],
          didIdentifiers[DELEGATEE_IDENTIFIER_KEY],
          response.data.delegatorIdentifier,
          keyType
        );

      addIssuedCredential(delegateeCredential, DELEGATEE_CREDENTIAL_KEY);

      try {
        await credentialServerApiClient.post<{ message: string }>(
          "/performance-credential/set",
          delegatorCredential
        );
      } catch (err) {
        console.log(err);
        throw new Error("Credential uploading failed");
      }
    } catch (err) {
      console.log(err);
      throw new Error("DID Creation failed");
    }
  };

  const delegateCredential = async () => {
    const vpForADC: VerifiablePresentation =
      await didKeyAgent.createVerifiablePresentation({
        presentation: {
          holder: didIdentifiers[DELEGATEE_IDENTIFIER_KEY].did,
          verifiableCredential: [issuedCredential[DELEGATEE_CREDENTIAL_KEY]],
        },
        proofFormat: "jwt",
      });

    try {
      const response: AxiosResponse<DelegationResponse> =
        await credentialServerApiClient.post<DelegationResponse>(
          "/performance-credential/get-adc",
          vpForADC
        );

      console.log(response.data);

      addIssuedCredential(
        response.data.accessDelegationCredential,
        ACCESS_DELEGATION_CREDENTIAL_KEY
      );

      console.log(issuedCredential);
    } catch (err) {
      console.log(err);
      throw new Error("Delegation Failed");
    }
  };

  const verifyCredential = async () => {
    const vpForVerification: VerifiablePresentation =
      await didKeyAgent.createVerifiablePresentation({
        presentation: {
          holder: didIdentifiers[DELEGATEE_IDENTIFIER_KEY].did,
          verifiableCredential: [
            issuedCredential[ACCESS_DELEGATION_CREDENTIAL_KEY],
            issuedCredential[DELEGATEE_CREDENTIAL_KEY],
          ],
        },
        proofFormat: "jwt",
      });

    try {
      const response: AxiosResponse<VerificationResponse> =
        await credentialServerApiClient.post<VerificationResponse>(
          "/performance-credential/get",
          vpForVerification
        );

      console.log(response.data);
    } catch (err) {
      console.log(err);
      throw new Error("Delegation Failed");
    }
  };

  const evaluate: () => Promise<void> = async () => {
    issueCredential();

    const vpForADC: VerifiablePresentation =
      await didKeyAgent.createVerifiablePresentation({
        presentation: {
          holder: didIdentifiers[DELEGATEE_IDENTIFIER_KEY].did,
          verifiableCredential: [issuedCredential[DELEGATEE_CREDENTIAL_KEY]],
        },
        proofFormat: "jwt",
      });

    for (let i = 0; i <= 100; i++) {

      const delegationResponse: AxiosResponse<DelegationResponse> =
        await credentialServerApiClient.post<DelegationResponse>(
          "/performance-credential/get-adc",
          vpForADC
        );


      const vpForVerification: VerifiablePresentation =
      await didKeyAgent.createVerifiablePresentation({
        presentation: {
          holder: didIdentifiers[DELEGATEE_IDENTIFIER_KEY].did,
          verifiableCredential: [
            delegationResponse.data.accessDelegationCredential,
            issuedCredential[DELEGATEE_CREDENTIAL_KEY],
          ],
        },
        proofFormat: "jwt",
      });

      const verificationResponse: AxiosResponse<VerificationResponse> =
        await credentialServerApiClient.post<VerificationResponse>(
          "/performance-credential/get",
          vpForVerification
        );


      addEvaluationResult({
        Iteration: i,
        "Delegation Time Taken": delegationResponse.data.timeTaken,
        "Delegation Memory Usage": delegationResponse.data.memoryUsage,
        "Delegation CPU Usage": delegationResponse.data.cpuUsage,
        "Verification Time Taken": verificationResponse.data.verification.timeTaken,
        "Verification Memory Usage": verificationResponse.data.verification.memoryUsage,
        "Verification CPU Usage": verificationResponse.data.verification.cpuUsage,
        "Retrieval Time Taken": verificationResponse.data.retrieval.timeTaken,
        "Retrieval Memory Usage": verificationResponse.data.verification.memoryUsage,
        "Retrieval CPU Usage": verificationResponse.data.verification.cpuUsage,
      });
    }

    const csvData = Papa.unparse(evaluationResults);

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${keyType}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setEvaluationResults([]);
  };

  return (
    <JsonViewProvider>
      <div className="upper">
        <div className="left-section">
          <button onClick={issueCredential}>Issue credentials</button>
          <button onClick={delegateCredential}>Delegate credential</button>
          <button onClick={verifyCredential}>
            Present verifiable presentation
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

export default AlgorithmProtocolImplementation;
