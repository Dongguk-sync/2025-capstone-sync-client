import {FaTrash} from 'react-icons/fa'
import "./Study.css"

const Study =({schedules, onDelete, onStartStudy})=>{
    if(!schedules || schedules.length === 0){
        return <div className="NoSchedule">일정이 없습니다.</div>
    }
    
    return (
        <div className="StudyList">
      {schedules.map(item => (
        <div className="StudySche" key={item.id}>
          <div className="StudyTitle">{item.title}</div>
          <div className="StudyBtn">
            <button onClick={() => onStartStudy(item)}>
              학습하기
            </button>
            <button onClick={() => onDelete(item.id)} aria-label="삭제">
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
    )
};

export default Study