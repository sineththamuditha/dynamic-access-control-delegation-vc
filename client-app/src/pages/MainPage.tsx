import { useContext } from "react";
import { PageContext } from "../context/PageContext";
import { Page } from "../enums/PageEnum";
import React from "react";

const MainPage: React.FC = () => {
  const { setPage } = useContext(PageContext);

  const changePageToSupervisorStudent = () => {
    setPage(Page.STUDENT_SUPERVISOR);
  };

  const changePageToSupervisorStudentProtocol = () => {
    setPage(Page.PROTOCOL_STUDENT_SUPEVISOR);
  };

  const changePageToDoctorNurse = () => {
    setPage(Page.DOCTOR_NURSE);
  };

  const changePageToDoctorNurseProtocol = () => {
    setPage(Page.PROTOCOL_DOCTOR_NURSE);
  };

  const changePageToEmployeeProtocol = () => {
    setPage(Page.PROTOCOL_EMPLOYEE);
  };

  const changePageToED25519 = () => {
    setPage(Page.ED25519);
  }

  const changePageToX25519 = () => {
    setPage(Page.X25519);
  }

  const changePageToSecp256k1 = () => {
    setPage(Page.SECP256k1)
  }

  return (
    <div className="upper">
      <div className="left-section"></div>
      <div className="right-section">
        <button onClick={changePageToSupervisorStudent}>
          Supervisor Student Usecase
        </button>
        <button onClick={changePageToSupervisorStudentProtocol}>
          Supervisor Student Use Case Protocol Implementation
        </button>

        <button onClick={changePageToDoctorNurse}>Doctor Nurse Usecase</button>
        <button onClick={changePageToDoctorNurseProtocol}>
          Doctor Nurse Use Case Protocol Implementation
        </button>
        <button onClick={changePageToEmployeeProtocol}>
          Employee Use Case Protocol Implementation
        </button>
        <button onClick={changePageToED25519}>Ed25519</button>
        <button onClick={changePageToX25519}>X25519</button>
        <button onClick={changePageToSecp256k1}>Secp256k1</button>
      </div>
    </div>
  );
};

export default MainPage;
