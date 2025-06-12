import Header from "../components/Header"
import Footer from "../components/Footer"
import Calendar from "../components/Calendar"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import {useState, useRef, useEffect} from 'react';
import "./MainPage.css";
import record from "../assets/record.png";
import DatePicker from "../components/DatePicker"
import RecordingModal1 from "../components/RecordingModal1";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import SubjectSearch from "../components/SubjectSearch";
import MaterialSearch from "../components/MaterialSearch";
import { format } from 'date-fns';
import AddStudy from "../components/AddStudyModal";
import AddExam from "../components/AddExamModal";


import instance, {getCurrentUser} from "../api/axios";

// token 관리
// import instance from '../api/axios';


export default function MainPage() {
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

  // const [reminder, setReminder] = useState(false);

  // 학습 등록하면 바로 달력에 반영되도록
  const [reloadCalendar, setReloadCalendar] = useState(0);
  const [mode, setMode] = useState('study');

  function openModal(type) {
    setModalStack(prev =>{
      const base = Array.isArray(prev) ? prev : [];
      return [...base, type];
    })
  }

  function goBackModal() {
    setModalStack(stack => {
      const next = stack.slice(0, -1);
      return next;
    })
  }

  function closeModal() {
    setModalStack([]);
  }


  // 일정추가 버튼 클릭시 (학습, 시험 일정 통합하여 추가)
  const handleAddSchedule = () => {
    setStudyItem(null);
    setSubject(null);
    setMaterial(null);
    setExamTitle('');
    setSelectedDate(new Date());
    openModal('addSchedule');
  }

  // Study → MainPage로, 기존 일정의 학습하기 클릭
  const handleStartStudy = (item) => {
    setStudyItem(item);      // 어떤 스케줄인지 저장
    openModal('startRecord');
  };

  const handleAddStudySubmit = async () => {
  if (!subject || !material) {
    alert('과목과 교안을 모두 선택해주세요.');
    return;
  }

  try {
    // 1) 로그인 사용자 ID 가져오기
    const user = await getCurrentUser();
    const userId = user.content.user_id;

    // 2) 백엔드가 기대하는 필드명(예: study_schedule_date, subject_id, material_id, user_id)로 페이로드 구성
    const payload = {
      study_schedule_date: format(selectedDate, 'yyyy-MM-dd'),
      subject_id: subject.id,
      file_id: material.id,
      user_id: userId
    };

    // 3) 토큰 헤더를 붙여서 POST
    const token = localStorage.getItem('accessToken');
    await instance.post(
      '/study-schedules',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 4) 모달 닫고 달력·공지 리로드
    goBackModal();
    setReloadCalendar(n => n + 1);

  } catch (err) {
    console.error('학습 일정 저장 오류', err);
    alert('학습 일정 저장 중 오류가 발생했습니다.');
  }
};

  // 시험 추가에 대한 부분
  const [examTitle, setExamTitle] = useState('');
 
  // — 시험 추가: 실 API 호출 후 달력·공지 즉시 갱신 —
  const handleAddExamSubmit = async () => {
    if (!examTitle.trim() || !subject) {
      alert('시험명과 과목을 모두 선택해주세요.');
      return;
    }

    try {
      const user = await getCurrentUser();
      const userId = user.content.user_id;
      const payload = {
        exam_schedule_date: format(selectedDate, 'yyyy-MM-dd'),
        exam_schedule_name: examTitle,
        subject_id: subject.id,
        user_id : userId
      };

      // 실제 API에 POST
      const token = localStorage.getItem('accessToken');
      await instance.post('/exam-schedules', payload, {
        headers: {Authorization: `Bearer ${token}`}
      });

      // 모달 닫고 리로드 트리거++
      goBackModal();
      setReloadCalendar(n => n + 1);
      // console.log("exam add", reloadCalendar)
    
    } catch (err) {
      console.error('시험 저장 오류', err);
      alert('시험 일정 저장 중 오류가 발생했습니다.');
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
      <Notice reloadTrigger={reloadCalendar}/>
      <div className="cal_todo">
        <Calendar 
          onAddSchedule={handleAddSchedule}
          onStartStudy={handleStartStudy}
          reloadTrigger={reloadCalendar}
          onReload={()=> setReloadCalendar(n=>n+1)}
        />
      </div>
      <Footer />


      {/* 모달창 관리 */}
       <Modal 
        className={`modal-content ${modalStack}`}
        overlayClassName="modal-overlay"
        isOpen={modalStack.length > 0} 
        onClose={closeModal}
        >

        {/* 학습 시작 모달 */}
        {currentModal === 'startRecord' && currentStudyItem && (
          <>
            <h2>{currentStudyItem.subjectName} - {currentStudyItem.materialTitle}</h2>
            <div className="record_img">
              <button 
                onClick={() => openModal('Recording')}>
                <img 
                    src={record} alt="record" className="profile_icon"
                />
              </button>
              <div>학습을 시작하려면 누르세요.</div>
              <div>녹음이 바로 시작됩니다.</div>
            </div>
          </>
        )}

        {/* 일정 추가 모달 */}
        {currentModal === 'addSchedule' && (
          <div className="AddStudy">
            <p>{mode === 'study' ? '학습' : '시험'} 일정을 등록해주세요</p>
            <div className="AddStudyDiv">
              <div className="AddStudyDiv"> 
                {/* 날짜 선택하는 공통 부분 */}
                <div className="AddStudyDate">              
                  <label>날짜</label>
                  <DatePicker 
                    selected={selectedDate}
                    onChange={setSelectedDate}/>
                </div>
              </div>
              <div className="right_content">
                <div className="toggle-btn">
                  <button
                    className={mode==='study'? 'active': ''}
                    onClick={()=> {
                      setMode('study')}}>
                      학습추가
                  </button>
                  <button
                    className={mode==='exam'? 'active' : ''}
                    onClick={()=>{
                      setMode('exam')}}>
                    시험추가
                    </button>
                </div>
                {/* mode에 따라 study추가인지, Exam추가인지 렌더링 */}
                <div className="studyORexam">
                  {mode === 'study'?
                    <AddStudy 
                      selectedDate={selectedDate}
                      subject={subject}
                      material={material}
                      onSubjectSelect={() => openModal('searchSubject')}
                      onMaterialSelect={()=> openModal('searchMaterial')}
                      onSubmit={handleAddStudySubmit}
                      />
                    :
                    <AddExam 
                      selectedDate={selectedDate}
                      examTitle={examTitle}
                      subject={subject}
                      setExamTitle={t => setExamTitle(t)}
                      onSubjectSelect={() => openModal('searchSubject')}
                      onSubmit={handleAddExamSubmit}
                    />}
                  </div>
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
                  subjectName = {subject.name}
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

        {/* 실제 녹음 중 모달 창 */}
        {currentModal === 'Recording' && (
          <div>
            <RecordingModal1
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
          </div>
        )}
      </Modal>
    </div>
  )
}
