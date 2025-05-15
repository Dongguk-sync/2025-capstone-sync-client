import Header from "../components/Header"
import Footer from "../components/Footer"
import Calender from "../components/Calender"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import {useState} from 'react';

export default function MainPage({goTo}) {

  const [showModal, setShowModal]       = useState(false);
  const [currentStudyItem, setStudyItem] = useState(null);

  // Calender → MainPage로, +학습추가 클릭
  const handleAddStudy = () => {
    setStudyItem(null);      // 새로 추가할 땐 아이템 정보 비움
    setShowModal(true);
  };

  // Study → MainPage로, 기존 일정의 학습하기 클릭
  const handleStartStudy = (item) => {
    setStudyItem(item);      // 어떤 스케줄인지 저장
    setShowModal(true);
  };


  return (
    <div className="Main">
      <Header goTo={goTo}/>
      <Notice />
      <div className="cal_todo">
        <Calender 
          onAddStudy={handleAddStudy}
          onStartStudy={handleStartStudy}
        />
      </div>
      <Footer />
      {/* 여기부터 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {currentStudyItem ? (
          <>
            <h2>“{currentStudyItem.title}” 학습 시작</h2>
            <p>{currentStudyItem.date} 일정의 학습을 시작합니다.</p>
          </>
        ) : (
          <>
            <h2>새 학습 추가</h2>
            <p>어떤 학습을 추가하시겠어요?</p>
          </>
        )}
        <button onClick={() => {
          // 예: goTo("learning") 로 실제 학습 페이지로 이동
          goTo("learning", currentStudyItem);
          setShowModal(false);
        }}>
          {currentStudyItem ? "시작하기" : "추가하기"}
        </button>
      </Modal>
    </div>
  )
}
