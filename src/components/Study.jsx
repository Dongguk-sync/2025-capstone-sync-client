import {FaTrash} from 'react-icons/fa'
import "./Study.css"

const Study =()=>{
    return (
        <div className="StudySche">
            <div>데이터통신</div>
            <div className="StudyBtn">
                <button>학습하기</button>
                <button><FaTrash size={10} /></button>
            </div> 
       </div>
    )
};

export default Study