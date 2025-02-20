import { useContext } from "react";
import { PageContext } from "../context/PageContext";
import { Page } from "../enums/PageEnum";

const MainPage: React.FC = () => {
  const { setPage } = useContext(PageContext);

  const changePageToSupervisorStudent = () => {
    setPage(Page.STUDENT_SUPERVISOR);
  };

  const changePageToDoctorNurse = () => {
    setPage(Page.DOCTOR_NURSE);
  };

  return (
    <div className="upper">
      <div className="left-section"></div>
      <div className="right-section">
        <button onClick={changePageToSupervisorStudent}>
          Supervisor Student Usecase
        </button>
        <button onClick={changePageToDoctorNurse}>Doctor Nurse Usecase</button>
      </div>
    </div>
  );
};

export default MainPage;
