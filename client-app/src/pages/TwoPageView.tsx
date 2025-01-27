import Console from "./Console";
import StudentSupervisor from "./usecases/StudentSupervisor/StudentSupervisor";


const TwoPageView: React.FC = () => {
    return (
        <div className="container">
            <div className='left-panel'>
                <StudentSupervisor />
            </div>
            <Console />
        </div>
    );
}

export default TwoPageView;