import Header from "../components/Header"
import Footer from "../components/Footer"
import Calender from "../components/Calender"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import {useState, useRef, useEffect} from 'react';
import "./MainPage.css";
import record from "../assets/record.jpg";
import DatePicker from "../components/DatePicker"
import OnOffToggle from "../components/OnOff";
import RecordingModal from "../components/RecordingModal"
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import SubjectSearch from "../components/SubjectSearch";
import MaterialSearch from "../components/MaterialSearch";
// import { getStudiesByDate, saveStudy } from '../data/mockStudyService';
import { getSchedulesInRange as getStudiesByDate, saveSchedule as saveStudy } from "../data/mockStudyService";
import { format } from 'date-fns';


export default function MainPage() {

  // const [showInitialModal, setShowInitialModal]     = useState(false)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [currentStudyItem, setStudyItem]            = useState(null)
  const [selectedDate, setSelectedDate]             = useState(new Date())

  // 녹음 상태 & refs
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef          = useRef(null)
  const audioChunksRef            = useRef([])

  // 녹음 된 파일 확인
  const [audioUrl, setAudioUrl] = useState(null);

  // 모달창 뒤로가기 기능을 위해 모달창을 스택으로 관리
  const [ modalStack, setModalStack ] = useState([]);
  const currentModal = modalStack[modalStack.length - 1] || null;

  // 과목, 교안 선택 결과 담는 함수들
  const [subject, setSubject ] = useState(null);
  const [material, setMaterial ] = useState(null);

  const [reminder, setReminder] = useState(false);

  // 학습 등록하면 바로 달력에 반영되도록
  // const [reloadCalendar, set]
  const [schedules, setSchedules] = useState([]);

//  const refreshSchedules = async () => {
//     const dateStr = selectedDate.toISOString().slice(0, 10);
//     const list = await getStudiesByDate(dateStr);
//     setSchedules(list);
//  }

  function openModal(type) {
    setModalStack(stack => [...stack, type]);
  }

  function goBackModal() {
    setModalStack(stack => {
      const next = stack.slice(0, -1);
      return next;
    })
  }



  // Calender → MainPage로, +학습추가 클릭
  const handleAddStudy = () => {
    setStudyItem(null);      // 새로 추가할 땐 아이템 정보 비움
    setSubject(null);
    setMaterial(null);
    setReminder(false);
    setSelectedDate(new Date());
    openModal('addStudy')
  };

  // Study → MainPage로, 기존 일정의 학습하기 클릭
  const handleStartStudy = (item) => {
    setStudyItem(item);      // 어떤 스케줄인지 저장
    openModal('startRecord');
  };

  const handleAddExam = () => {
    setStudyItem(null);
    setSubject(null);
    setMaterial(null);
    setReminder(false);
    openModal('addExam');
  }

  const onClickRecord = () => {
    setShowRecordingModal(true)
  }

  const handleAddStudySubmit = async () => {
    if (!subject || !material) {
      alert('과목과 교안을 선택해주세요.');
      return;
    }
    // setLoading(true);
    try {
      // 실제 API 와 연결하면 실행
      // const res = await fetch('/api/studies', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     date: selectedDate.toISOString().slice(0,10),
      //     subjectId: subject.id,
      //     materialId: material.id,
      //     reminder: reminder
      //   })
      // });
      // if (!res.ok) throw new Error('저장 실패');
      // await res.json();
      // goBackModal();           // 모달 닫기
      // refreshSchedules();      // 캘린더 새로고침
      await saveStudy({
        date: format(selectedDate, 'yyyy-MM-dd'),
        subjectId: subject.id,
        subjectName: subject.name,
        materialTitle: material.title,
        reminder
      });
      goBackModal();

      const dateStr = selectedDate.toISOString().slice(0,10);
      const list = await getStudiesByDate(dateStr);
      setSchedules(list);
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      // setLoading(false);
    }
  };


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

  useEffect(() => {
    const dateStr = selectedDate.toISOString().slice(0,10);
    getStudiesByDate(dateStr).then(setSchedules);
  }, [selectedDate]);


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
        className={`modal-content ${modalStack}`}
        overlayClassName="modal-overlay"
        isOpen={modalStack.length > 0} 
        onClose={goBackModal}
        >

        {/* 학습 시작 모달 */}
        {currentModal === 'startRecord' && currentStudyItem && (
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
        {currentModal === 'addStudy' && (
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
                    value={subject?.name || ''}
                    readOnly
                    placeholder="과목 선택"
                  />
                </div>
                <button 
                  className="SelectSubject-btn"
                  onClick={() => openModal('searchSubject')}
                  >과목 선택</button>
                
              </div>
              <div className="SelectMeterial">
                <div className="SelectMeterial-row">
                  <label>교안</label>
                  <input
                    type="text"
                    value={material?.title || ''}
                    readOnly
                    placeholder="교안 선택"
                  />
                </div>
                <button 
                  className="SelectMeterial-btn"
                  onClick={() => openModal('searchMaterial')}
                >교안선택</button>
                
              </div>
              <div className="Alarm">
                <label>학습 알림</label>
                <OnOffToggle />
              </div>
              <button 
                className="AddStudySubmit"
                onClick={handleAddStudySubmit}
              >등록
              </button>
            </div>
            </div>
          </div>
        )}

        {/* 시험 추가 모달 */}
        {currentModal === 'addExam' && (
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
                      value={subject?.name || ''}
                      readOnly
                      placeholder="과목 선택"
                    />
                  </div>
                <button 
                  className="SelectSubject-btn"
                  onClick={() => openModal('searchSubject')}
                  >과목 선택</button>
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

        {/* 과목 검색 모달 */}
        {currentModal === 'searchSubject' && (
          <div>
            <button className="goBack_btn">
              <FaArrowLeft 
                onClick={goBackModal}/>
            </button>
            <div className="searchSubject">
              <div>과목 검색</div>
              <div className="searchContent">
                <SubjectSearch
                  onSelect={sub => {
                    setSubject(sub);
                    goBackModal();
                  }} 
                />
              </div>
            </div> 
          </div>
        )}

        {/* 교안 검색 모달 */}
        {currentModal === 'searchMaterial' && (
          <div>
            <button className="goBack_btn">
              <FaArrowLeft 
                onClick={goBackModal}/>
            </button>
            <div className="searchSubject">
              <div>교안 검색</div>
              <div className="searchContent">
                <MaterialSearch
                  subjectId={subject.id}
                  onSelect={mat => {
                    setMaterial(mat);
                    goBackModal();
                  }} 
                />
              </div>
            </div> 
          </div>
        )}
      </Modal>
      
      {/* 실제 녹음 중 모달 창 */}
      <Modal 
        className={`modal-content ${modalStack}`}
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
