import Header from "../components/Header"
import Footer from "../components/Footer"
import Calender from "../components/Calender"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import {useState} from 'react';
import { Link } from 'react-router-dom'; 
import "./MainPage.css";
import record from "../assets/record.jpg";
import DatePicker from "../components/DatePicker"
import OnOffToggle from "../components/OnOff";


export default function MainPage() {

  const [showModal, setShowModal]       = useState(false);
  const [currentStudyItem, setStudyItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calender → MainPage로, +학습추가 클릭
  const handleAddStudy = () => {
    setStudyItem(null);      // 새로 추가할 땐 아이템 정보 비움
    setShowModal(true);
    setModalType('addStudy')
  };

  // Study → MainPage로, 기존 일정의 학습하기 클릭
  const handleStartStudy = (item) => {
    setStudyItem(item);      // 어떤 스케줄인지 저장
    setShowModal(true);
    setModalType('startRecord');
  };

  const handleAddExam = () => {
    setStudyItem(null);
    setShowModal(true);
    setModalType('addExam');
  }


  return (
    <div className="Main">
      <Header />
      <Notice />
      <div className="cal_todo">
        <Calender 
          onAddStudy={handleAddStudy}
          onStartStudy={handleStartStudy}
          onAddExam={handleAddExam}
        />
      </div>
      <Footer />


      {/* 모달창 관리 */}
       <Modal 
        className={`modal-content ${modalType}`}
        overlayClassName="modal-overlay"
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        >
        {/* 학습 시작 모달 */}
        {modalType === 'startRecord' && currentStudyItem && (
          <>
            <h2>{currentStudyItem.title}</h2>
            <div className="record_img">
              <button>
                <img 
                    src={record} alt="record" className="profile_icon"
                />
              </button>
            </div>
          </>
        )}

        {/* 학습 추가 모달 */}
        {modalType === 'addStudy' && (
          <div className="AddStudy">
            <p>학습 일정을 등록해주세요</p>
            <div className="AddStudyDiv"> 
            <div className="AddStudyDate">              
              <label>날짜</label>
              <DatePicker 
                selected={selectedDate}
                onChange={setSelectedDate}/>
            </div>
            <div className="AddStudyDetail">
              <div className="SelectSubject">
                <div className="SelectSubject-row">
                  <label>과목</label>
                  <input
                    type="text"
                    //value={subject}
                    readOnly
                    placeholder="과목 선택"
                  />
                </div>
                <button className="SelectSubject-btn">과목 선택</button>
                
              </div>
              <div className="SelectMeterial">
                <div className="SelectMeterial-row">
                  <label>교안</label>
                  <input
                    type="text"
                    //value={meterial}
                    readOnly
                    placeholder="교안 선택"
                  />
                </div>
                <button className="SelectMeterial-btn">교안선택</button>
                
              </div>
              <div className="Alarm">
                <label>학습 알림</label>
                <OnOffToggle />
              </div>
              <button 
                className="AddStudySubmit"
                >제출하기
              </button>
            </div>
          </div>
        </div>
        )}

        {/* 시험 추가 모달 */}
        {modalType === 'addExam' && (
          <>
            <h2>시험 일정 추가</h2>
            <p>시험 이름과 날짜를 입력해주세요.</p>         
            <Link to="/exam/new">
              <button onClick={() => setShowModal(false)}>
                등록하기
              </button>
            </Link>
          </>
        )}
      </Modal>
    </div>
  )
}
