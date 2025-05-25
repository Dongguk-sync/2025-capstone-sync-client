import Header from "../components/Header"
import Footer from "../components/Footer"
import Calender from "../components/Calender"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import {useState, useRef, useEffect} from 'react';
import { Link } from 'react-router-dom'; 
import "./MainPage.css";
import record from "../assets/record.jpg";
import DatePicker from "../components/DatePicker"
import OnOffToggle from "../components/OnOff";
import RecordingModal from "../components/RecordingModal"


export default function MainPage() {

  const [showInitialModal, setShowInitialModal]     = useState(false)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [currentStudyItem, setStudyItem]            = useState(null)
  const [modalType, setModalType]                   = useState(null)
  const [selectedDate, setSelectedDate]             = useState(new Date())

  // 녹음 상태 & refs
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef          = useRef(null)
  const audioChunksRef            = useRef([])

  // 녹음 된 파일 확인
  const [audioUrl, setAudioUrl] = useState(null);

  // Calender → MainPage로, +학습추가 클릭
  const handleAddStudy = () => {
    setStudyItem(null);      // 새로 추가할 땐 아이템 정보 비움
    setShowInitialModal(true);
    setModalType('addStudy')
  };

  // Study → MainPage로, 기존 일정의 학습하기 클릭
  const handleStartStudy = (item) => {
    setStudyItem(item);      // 어떤 스케줄인지 저장
    setShowInitialModal(true);
    setModalType('startRecord');
  };

  const handleAddExam = () => {
    setStudyItem(null);
    setShowInitialModal(true);
    setModalType('addExam');
  }

  const onClickRecord = () => {
    setShowInitialModal(false)
    setShowRecordingModal(true)
  }


  useEffect(() => {
    if (!mediaRecorderRef.current) return;
    const recorder = mediaRecorderRef.current;
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url  = URL.createObjectURL(blob);
      setAudioUrl(url);
      // 필요시: URL.revokeObjectURL(url) 로 해제
    };
  }, [/* 이펙트가 recorder 로직 이후 실행되도록 deps 조정 */]);

  const startRecording = async () => {
    try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = e => {
        // 데이터 청크가 들어올 때마다 배열에 저장
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
    };

    mediaRecorderRef.current.onstop = () => { 
        // 녹음이 멈추면 모든 청크를 blob으로 합쳐 URL 생성
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        setAudioUrl(url);
     };

    mediaRecorderRef.current.start();
    setRecording(true);
  } catch(err){
      console.error('마이크 권한 오류:', err);
      alert('녹음 권한이 필요합니다.');
  }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };


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
        isOpen={showInitialModal} 
        onClose={() => setShowInitialModal(false)}
        >

        {/* 학습 시작 모달 */}
        {modalType === 'startRecord' && currentStudyItem && (
          <>
            <h2>{currentStudyItem.title}</h2>
            <div className="record_img">
              <button onClick={onClickRecord}>
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
              >등록
              </button>
            </div>
            </div>
          </div>
        )}

        {/* 시험 추가 모달 */}
        {modalType === 'addExam' && (
          <div className="AddExam">
            <p>시험 일정을 등록해주세요</p>        
            <div className="AddExamDiv"> 
              <div className="AddExamDate">              
                <label>날짜</label>
                <DatePicker 
                  selected={selectedDate}
                  onChange={setSelectedDate}/>
              </div>
              <div className="AddExamDetail">
                <div className="AddExamTitle">
                  <label>시험명</label>
                  <input 
                    type="text"
                    placeholder="시험명을 입력하세요"
                  />
                </div>

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
              <div>
                <div className="Alarm">
                  <label>시험 전 학습 자동 생성</label>
                  <OnOffToggle />
                </div>
                <div className="Alarm">
                  <label>학습 알림</label>
                  <OnOffToggle />
                </div>
              </div>
              <button 
                className="AddStudySubmit"
              >등록
              </button>
            </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 실제 녹음 중 모달 창 */}
      <Modal 
        className={`modal-content ${modalType}`}
        overlayClassName="modal-overlay"
        isOpen={showRecordingModal} 
        onClose={() => setShowRecordingModal(false)}
        >
        <RecordingModal
          isOpen={ showRecordingModal }
          onClose={()=> setShowRecordingModal(false)}
          studyItem={currentStudyItem}
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          />

        {audioUrl && (
          <div>
            <h4>녹음 미리 듣기</h4>
            <audio src={audioUrl} controls />
          </div>
        )}

        </Modal>
        

    </div>
  )
}
