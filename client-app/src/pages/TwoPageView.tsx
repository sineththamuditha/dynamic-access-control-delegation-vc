import { useContext, useEffect, useState } from "react";
import Console from "./Console";
import StudentSupervisor from "./usecases/StudentSupervisor/StudentSupervisor";
import { Page } from "../enums/PageEnum";
import MainPage from "./MainPage";
import { PageContext } from "../context/PageContext";
import DoctorNurse from "./usecases/DoctorNurse/DoctorNurse";
import React from "react";

const TwoPageView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<JSX.Element>(<MainPage />);
  const { page } = useContext(PageContext);

  useEffect(() => {
    switch (page) {
      case Page.MAIN_PAGE:
        setCurrentPage(<MainPage />);
        break;
      case Page.STUDENT_SUPERVISOR:
        setCurrentPage(<StudentSupervisor />);
        break;
      case Page.DOCTOR_NURSE:
        setCurrentPage(<DoctorNurse />);
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
