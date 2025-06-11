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
// import { getStudiesByDate, saveStudy } from '../data/mockStudyService';
// import { getSchedulesInRange as getStudiesByDate, saveSchedule as saveStudy } from "../data/mockStudyService";
import { format } from 'date-fns';
// import { saveExams, getExamsByDate } from '../data/mockExamService'
import AddStudy from "../components/AddStudyModal";
import AddExam from "../components/AddExamModal";

import { saveExam } from "../api/examService";

// token 관리
// import instance from '../api/axios';


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
  const [reloadCalendar, setReloadCalendar] = useState(0);
  const [schedules, setSchedules] = useState([]);

  const [mode, setMode] = useState('study');


//  const refreshSchedules = async () => {
//     const dateStr = selectedDate.toISOString().slice(0, 10);
//     const list = await getStudiesByDate(dateStr);
//     setSchedules(list);
//  }

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
    setReminder(null);
    setSelectedDate(new Date());
    openModal('addSchedule');
  }

  // Calendar → MainPage로, +학습추가 클릭
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
    setExamTitle(null);
    setSubject(null);
    setReminder(false);
    setSelectedDate(new Date());
    openModal('addExam');
  }

  const handleAddStudySubmit = async () => {
    if (!subject || !material) {
      alert('과목과 교안을 선택해주세요.');
      return;
    }
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
      setReloadCalendar(n=>n+1);
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      // setLoading(false);
    }
  };

  // 시험 추가에 대한 부분
  const [examTitle, setExamTitle] = useState('');
  // const [autoCreateExam, setAutoCreateExam] = useState(false);
  // const [examReminder, setExamReminder] = useState(false);


  const handleAddExamSubmit = async () => {
    if (!examTitle.trim() || !subject) {
      alert('시험명을 입력하고 과목을 선택해주세요.');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const saveRes = await saveExam({
        date: dateStr,
        title: examTitle,
        subjectId: subject.id,
        subjectName: subject.name,
      });
      goBackModal();
      console.log('SAVE RESPONSE ', saveRes);

      // const dateStr = selectedDate.toISOString().slice(0,10);
      const exams = await getExamsByDate(dateStr);
      setSchedules(exams);
      setReloadCalendar(n=>n+1);
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
      <Notice reloadTrigger={reloadCalendar}/>
      <div className="cal_todo">
        <Calendar 
          onAddStudy={handleAddStudy}
          onAddSchedule={handleAddSchedule}
          onStartStudy={handleStartStudy}
          onAddExam={handleAddExam}
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
