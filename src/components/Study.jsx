import {FaTrash, FaCheck, FaPencilAlt} from 'react-icons/fa'
import "./Calendar.css";

const Study =({schedules, onDelete, onStartStudy, onViewResult})=>{
    if(!schedules || schedules.length === 0){
        return (
          <div className="NoSchedule">
            일정이 없습니다.<br/>
            학습을 추가해보세요.
          </div>)
    }

      // 1) UNCOMP 먼저, COMP는 뒤로
    const sorted = [...schedules].sort((a, b) => {
      if (a.study_schedule_completed === b.study_schedule_completed) return 0;
      return a.study_schedule_completed === "COMP" ? 1 : -1;
    });
    
    return (
          <div className="studySection">
            <div className="studyLabel">학습 일정</div>
            {sorted.map(item => (
              <div className="StudyItem" key={item.study_schedule_id}>
                <div className="StudyGroup">
                  <div className={`StudyStatus ${item.study_schedule_completed === "COMP" ? "completed" : "uncompleted"}`}>
                    {item.study_schedule_completed === "COMP" ? 
                      <FaCheck className="icon-completed"/> : <FaPencilAlt className="icon-new"/>}
                  </div>

                  <div className="StudyTitle">
                    {item.subject_name} - {item.file_name}</div>
                </div>
                

                <div className="StudyBtns">
                  {item.study_schedule_completed === "COMP" ? (
                // 완료된 건은 '결과보기' 버튼
                <button
                  onClick={() => onViewResult(item)}
                  className="ResultBtn"
                >
                  결과보기
                </button>
              ) : (
                // 미완료 건은 '학습하기'
                <button
                  onClick={() => onStartStudy(item)}
                  className="StudyBtn"
                >
                  학습하기
                </button>
              )}
                
                {/* <button onClick={() => onStartStudy(item)} className="StudyBtn">
                  학습하기
                </button> */}


                {item.study_schedule_completed !== "COMP" && (
                  <button
                    onClick={() => onDelete(item.study_schedule_id)}
                    aria-label="삭제"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            </div>
            ))}
    </div>
    )
};

export default Study