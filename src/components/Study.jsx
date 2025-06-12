import {FaTrash} from 'react-icons/fa'
import "./Calendar.css";

const Study =({schedules, onDelete, onStartStudy})=>{
    if(!schedules || schedules.length === 0){
        return (
          <div className="NoSchedule">
            일정이 없습니다.<br/>
            학습을 추가해보세요.
          </div>)
    }
    
    return (
          <div className="studySection">
            <div className="studyLabel">학습 일정</div>
            {schedules.map(item => (
            <div className="StudyItem" key={item.study_schedule_id}>
              <div className="StudyTitle">{item.subject_name} - {item.file_name}</div>
              <div className="StudyBtns">
                <button onClick={() => onStartStudy(item)} className="StudyBtn">
                  학습하기
                </button>
                <button onClick={() => onDelete(item.study_schedule_id)} aria-label="삭제">
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            ))}
    </div>
    )
};

export default Study