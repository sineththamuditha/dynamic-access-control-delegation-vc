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

  const hospitalDIDKey: string = "hospitalDID";
  const doctorDIDKey: string = "doctorDID";
  const nurseDIDKey: string = "nurseDID";

  const hospitalWalletKey: string = "hospitalWallet";
  const doctorWalletKey: string = "doctorWallet";
  const nurseWalletKey: string = "nurseWallet";

  const doctorHospitalCredentialIdKey: string = "doctorHospitalCredentialId";
  const nurseHospitalCredentialIdKey: string = "nurseHospitalCredentialId";
  const delegatedDoctorCredentialKey: string = "delegatedDoctorCredentialId";

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
    if (hasDID(hospitalDIDKey)) {
      retrieveWallet(dids[hospitalDIDKey]).then((hospitalWallet) => {
        addWallet(hospitalWalletKey, hospitalWallet);
        addDID(hospitalDIDKey, hospitalWallet.did);
      });
    } else {
      createWallet().then((nullableHospitalWallet) => {
        const hospitalWallet: Wallet = nullableHospitalWallet as Wallet;
        addWallet(hospitalWalletKey, hospitalWallet);
        addDID(hospitalDIDKey, hospitalWallet.did);
      });
    }

    if (hasDID(doctorDIDKey)) {
      retrieveWallet(dids[doctorDIDKey]).then((doctorWallet) => {
        addWallet(doctorWalletKey, doctorWallet);
        addDID(doctorDIDKey, doctorWallet.did);
      });
    } else {
      createWallet().then((nullableDoctorWallet) => {
        const doctorWallet: Wallet = nullableDoctorWallet as Wallet;
        addWallet(doctorWalletKey, doctorWallet);
        addDID(doctorDIDKey, doctorWallet.did);
      });
    }

    if (hasDID(nurseDIDKey)) {
      retrieveWallet(dids[nurseDIDKey]).then((nurseWallet) => {
        addWallet(nurseWalletKey, nurseWallet);
        addDID(nurseDIDKey, nurseWallet.did);
      });
    } else {
      createWallet().then((nullableNurseWallet) => {
        const nurseWallet: Wallet = nullableNurseWallet as Wallet;
        addWallet(nurseWalletKey, nurseWallet);
        addDID(nurseDIDKey, nurseWallet.did);
      });
    }
  }, []);

  const issueHospitalCredentials = async () => {
    const {doctorVC, nurseVC} = await issueHospitalVerifiableCredentials(dids[hospitalDIDKey], dids[doctorDIDKey], dids[nurseDIDKey]);

    const storedIds: string[] = await storeCredentials([doctorVC, nurseVC]);

    addStoredCredential(doctorHospitalCredentialIdKey, storedIds[0]);
    addStoredCredential(nurseHospitalCredentialIdKey, storedIds[1]);

    setJson({
      doctorHospitalVC: doctorVC,
      nurseHospitalVC: nurseVC
    })

    addLog("Hospital credentials for doctor and nurse issued")
  };

  const delegateDoctorCredential = async () => {

    const delegatedVC: VerifiableCredential |  null = await delegateDoctorVerifiableCredential( dids[nurseDIDKey], dids[doctorDIDKey]);

    if (!delegatedVC) {
      throw new Error("Error in creating delegated credential")
    }

    const storedIds: string[] = await storeCredentials([delegatedVC]);

    addStoredCredential(delegatedDoctorCredentialKey, storedIds[0])

    setJson(delegatedVC)

    addLog("Hospital credential of the doctor is delegated to nurse")
  }

  const presentVerifiablePresentation = async () => {

    const verifiablePresentation: VerifiablePresentation | null = await createPresentation(
      {
        presentation: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          type: ["VerifiablePresentation"],
          holder: dids[nurseDIDKey],
          verifiableCredential: [
            await fetchCredential(storedCredentialIds[delegatedDoctorCredentialKey]),
            await fetchCredential(storedCredentialIds[nurseHospitalCredentialIdKey])
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
    <JsonViewProvider children={undefined}>
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
