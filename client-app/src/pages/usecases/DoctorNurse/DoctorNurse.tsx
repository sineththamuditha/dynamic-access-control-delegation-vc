import { useContext, useEffect, useState } from "react";
import JsonViewProvider from "../../../context/JsonViewContext";
import { PageContext } from "../../../context/PageContext";
import { Page } from "../../../enums/PageEnum";
import { Wallet } from "./models/wallet";
import { createWallet } from "./apis/walletClient/walletCreation";
import { createPresentation } from "./apis/presentationClient/createPresentation";
import { LogContext } from "../../../context/LogContext";
import { DIDStore } from "../../../context/didStore";
import { retrieveWallet } from "./apis/walletClient/walletRetrieval";
import { JsonView } from "react-json-view-lite";
import { issueHospitalVerifiableCredentials } from "./flows/issueHospitalCredentials";
import { CONFIG } from "../../../constants";
import { storeCredentials } from "./apis/credentialClient/credentialStoring";
import { fetchCredential } from "./apis/credentialClient/credentialFetch";
import { VerifiableCredential, VerifiablePresentation } from "@veramo/core";
import { delegateDoctorVerifiableCredential } from "./flows/delegateDoctorCredential";
import { verifyPresentation } from "./apis/presentationClient/verifyPresentation";
import { presentAndVerifyVerifiablePresentation } from "./flows/PresentAndVerifyVerifiablePresentation";
import React from "react";

const DoctorNurse: React.FC = () => {
  const [wallets, setWallets] = useState<{ [key: string]: Wallet }>({});
  const { setPage } = useContext(PageContext);
  const { dids, addDID, hasDID } = useContext(DIDStore);
  const [json, setJson] = useState<any>({});
  const { addLog, clearLogs } = useContext(LogContext);

  const [storedCredentialIds, setStoredCredentialIds] = useState< {[key:string]: string}>({});

  const HOSPITAL_DID_KEY: string = "hospitalDID";
  const DOCTOR_DID_KEY: string = "doctorDID";
  const NURSE_DID_KEY: string = "nurseDID";

  const HOSPITAL_WALLET_KEY: string = "hospitalWallet";
  const DOCTOR_WALLET_KEY: string = "doctorWallet";
  const NURSE_WALLET_KEY: string = "nurseWallet";

  const DOCTOR_HOSPITAL_CREDENTIAL_ID_KEY: string = "doctorHospitalCredentialId";
  const NURSE_HOSPITAL_CREDENTIAL_ID_KEY: string = "nurseHospitalCredentialId";
  const DELEGATED_DOCTOR_CREDENTIAL_ID_KEY: string = "delegatedDoctorCredentialId";

  const addWallet: (key: string, wallet: Wallet) => void = (
    key: string,
    wallet: Wallet
  ) => {
    setWallets((prevWallets) => ({
      ...prevWallets,
      [key]: wallet,
    }));
  };

  const goBackToMainPage = () => {
    setPage(Page.MAIN_PAGE);
  };

  const addStoredCredential: (key: string, credentialId: string) => void =  (
    key: string, 
    credentialId: string
  ) => {
    setStoredCredentialIds((prevStoredCredentialIds) => ({
      ...prevStoredCredentialIds,
      [key]: credentialId
    }))
  }

  useEffect(() => {
    if (hasDID(HOSPITAL_DID_KEY)) {
      retrieveWallet(dids[HOSPITAL_DID_KEY]).then((hospitalWallet) => {
        addWallet(HOSPITAL_WALLET_KEY, hospitalWallet);
        addDID(HOSPITAL_DID_KEY, hospitalWallet.did);
      });
    } else {
      createWallet().then((nullableHospitalWallet) => {
        const hospitalWallet: Wallet = nullableHospitalWallet as Wallet;
        addWallet(HOSPITAL_WALLET_KEY, hospitalWallet);
        addDID(HOSPITAL_DID_KEY, hospitalWallet.did);
      });
    }

    if (hasDID(DOCTOR_DID_KEY)) {
      retrieveWallet(dids[DOCTOR_DID_KEY]).then((doctorWallet) => {
        addWallet(DOCTOR_WALLET_KEY, doctorWallet);
        addDID(DOCTOR_DID_KEY, doctorWallet.did);
      });
    } else {
      createWallet().then((nullableDoctorWallet) => {
        const doctorWallet: Wallet = nullableDoctorWallet as Wallet;
        addWallet(DOCTOR_WALLET_KEY, doctorWallet);
        addDID(DOCTOR_DID_KEY, doctorWallet.did);
      });
    }

    if (hasDID(NURSE_DID_KEY)) {
      retrieveWallet(dids[NURSE_DID_KEY]).then((nurseWallet) => {
        addWallet(NURSE_WALLET_KEY, nurseWallet);
        addDID(NURSE_DID_KEY, nurseWallet.did);
      });
    } else {
      createWallet().then((nullableNurseWallet) => {
        const nurseWallet: Wallet = nullableNurseWallet as Wallet;
        addWallet(NURSE_WALLET_KEY, nurseWallet);
        addDID(NURSE_DID_KEY, nurseWallet.did);
      });
    }
  }, []);

  const issueHospitalCredentials = async () => {
    const {doctorVC, nurseVC} = await issueHospitalVerifiableCredentials(dids[HOSPITAL_DID_KEY], dids[DOCTOR_DID_KEY], dids[NURSE_DID_KEY]);

    const storedIds: string[] = await storeCredentials([doctorVC, nurseVC]);

    addStoredCredential(DOCTOR_HOSPITAL_CREDENTIAL_ID_KEY, storedIds[0]);
    addStoredCredential(NURSE_HOSPITAL_CREDENTIAL_ID_KEY, storedIds[1]);

    setJson({
      doctorHospitalVC: doctorVC,
      nurseHospitalVC: nurseVC
    })

    addLog("Hospital credentials for doctor and nurse issued")
  };

  const delegateDoctorCredential = async () => {

    const delegatedVC: VerifiableCredential |  null = await delegateDoctorVerifiableCredential( dids[NURSE_DID_KEY], dids[DOCTOR_DID_KEY]);

    if (!delegatedVC) {
      throw new Error("Error in creating delegated credential")
    }

    const storedIds: string[] = await storeCredentials([delegatedVC]);

    addStoredCredential(DELEGATED_DOCTOR_CREDENTIAL_ID_KEY, storedIds[0])

    setJson(delegatedVC)

    addLog("Hospital credential of the doctor is delegated to nurse")
  }

  const presentVerifiablePresentation = async () => {

    const verifiablePresentation: VerifiablePresentation | undefined = await createPresentation(
      {
        presentation: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          type: ["VerifiablePresentation"],
          holder: dids[NURSE_DID_KEY],
          verifiableCredential: [
            await fetchCredential(storedCredentialIds[DELEGATED_DOCTOR_CREDENTIAL_ID_KEY]),
            await fetchCredential(storedCredentialIds[NURSE_HOSPITAL_CREDENTIAL_ID_KEY])
          ]
        },
        options: {
          proofPurpose: "authentication",
          challenge: crypto.randomUUID()
        }
      }
    )

    setJson(verifiablePresentation)

    if (verifiablePresentation) {
      const verificationResult: boolean = await presentAndVerifyVerifiablePresentation(verifiablePresentation);

      addLog(`Created verifiable presentation verification result : ${verificationResult}`)
      return
    } 

    addLog("Please create a verifiable presentation for the flow")
  }

  return (
    <JsonViewProvider >
      <div className="upper">
        <div className="left-section">
          <button onClick={issueHospitalCredentials}>Issue credentials</button>
          <button onClick={delegateDoctorCredential}>Delegate credential to the nurse</button>
          <button onClick={presentVerifiablePresentation}>Present verifiable presentation</button>
          <button onClick={goBackToMainPage}>Go Back To Main Page</button>
        </div>
        <div className="right-section">
          <JsonView data={json} clickToExpandNode style={CONFIG.JSON_VIEW_STYLE_PROPS} />
        </div>
      </div>
    </JsonViewProvider>
  );
};

export default DoctorNurse;
