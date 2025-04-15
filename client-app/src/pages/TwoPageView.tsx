import { ReactNode, useContext, useEffect, useState } from "react";
import Console from "./Console";
import StudentSupervisorAddDelegatee from "./usecases/StudentSupervisor/StudentSupervisorAddDelegatee";
import { Page } from "../enums/PageEnum";
import MainPage from "./MainPage";
import { PageContext } from "../context/PageContext";
import DoctorNurse from "./usecases/DoctorNurse/DoctorNurse";
import React from "react";
import StudentSupervisorProtocol from "./usecases/StudentSupervisor/StudentSupervisorProtocol";
import DoctorNurseProtocol from "./usecases/DoctorNurse/DoctorNurseProtocol";
import EmployeeProtocol from "./usecases/Employee/EmployeeProtocol";
import AlgorithmImplementation from "./signing_algorithms/algorithmProtocolImplementation";
import StudentSupervisorAttenuated from "./usecases/StudentSupervisor/StudentSupervisorAttenuated";

const TwoPageView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<ReactNode>(<MainPage />);
  const { page } = useContext(PageContext);

  useEffect(() => {
    switch (page) {
      case Page.MAIN_PAGE:
        setCurrentPage(<MainPage />);
        break;
      case Page.STUDENT_SUPERVISOR_ADD_DELEGATEE:
        setCurrentPage(<StudentSupervisorAddDelegatee />);
        break;
      case Page.STUDENT_SUPERVISOR_ATTENUATED:
        setCurrentPage(<StudentSupervisorAttenuated />);
        break;
      case Page.DOCTOR_NURSE:
        setCurrentPage(<DoctorNurse />);
        break;
      case Page.PROTOCOL_STUDENT_SUPEVISOR:
        setCurrentPage(<StudentSupervisorProtocol />);
        break;
      case Page.PROTOCOL_DOCTOR_NURSE:
        setCurrentPage(<DoctorNurseProtocol />);
        break;
      case Page.PROTOCOL_EMPLOYEE:
        setCurrentPage(<EmployeeProtocol />);
        break;
      case Page.ED25519:
        setCurrentPage(<AlgorithmImplementation keyType={"Ed25519"} />);
        break;
      case Page.SECP256k1:
        setCurrentPage(<AlgorithmImplementation keyType={"Secp256k1"} />);
        break;
    }
  }, [page]);

  return (
    <div className="container">
      {currentPage}
      <Console />
    </div>
  );
};

export default TwoPageView;
