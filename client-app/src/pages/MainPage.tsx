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
    setPage(Page.PROTOCOL_DOCTO_NURSE);
  };

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
      </div>
    </div>
  );
};

export default MainPage;
