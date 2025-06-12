import Header from "../components/Header"
import Footer from "../components/Footer"
import Calendar from "../components/Calendar"
import Notice from "../components/Noitce"
import Modal from "../components/Modal"
import { useState, useRef, useEffect } from 'react';
import "./MainPage.css";
import record from "../assets/record.png";
import DatePicker from "../components/DatePicker"

import RecordingModal2 from "../components/RecordingModal2";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import SubjectSearch from "../components/SubjectSearch";
import MaterialSearch from "../components/MaterialSearch";
import { format } from 'date-fns';
import AddStudy from "../components/AddStudyModal";
import AddExam from "../components/AddExamModal";


import instance, {getCurrentUser} from "../api/axios";

export default function MainPage() {
  // const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [currentStudyItem, setStudyItem]            = useState(null)
  const [selectedDate, setSelectedDate]             = useState(new Date())

  // 녹음 상태 & refs
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef          = useRef(null)
  const audioChunksRef            = useRef([])

  // 녹음 된 파일 확인
  const [audioUrl, setAudioUrl] = useState(null);
  const [wavBlob, setWavBlob] = useState(null);
  // const [wavBlobs, setWavBlobs] = useState([]);

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

  const [audioStream, setAudioStream] = useState(null);

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

    // WAV 변환 유틸
  const convertWebmToWav = async (webmBlob) => {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBuffer = encodeWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const encodeWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataLength = audioBuffer.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    let offset = 0;
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset++, str.charCodeAt(i));
    };
    writeString('RIFF');
    view.setUint32(offset, 36 + dataLength, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, bitsPerSample, true); offset += 2;
    writeString('data');
    view.setUint32(offset, dataLength, true); offset += 4;
    const channelData = Array.from({ length: numChannels }, (_, ch) => audioBuffer.getChannelData(ch));
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = Math.max(-1, Math.min(1, channelData[ch][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }
    return buffer;
  };

  useEffect(() => {
    if (!mediaRecorderRef.current) return;
    const recorder = mediaRecorderRef.current;
    recorder.onstop = async () => {
      const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const _waveBlob = await convertWebmToWav(webmBlob);

      setWavBlob(_waveBlob);

      // setWavBlobs(prev => [...prev, _waveBlob]);

      const wavUrl = URL.createObjectURL(_waveBlob);
      setAudioUrl(wavUrl);
    };
  }, [mediaRecorderRef.current]);

  const startRecording = async () => {
  try {
    // 1) 마이크 권한 요청 및 스트림 획득
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // → 이 한 줄 추가!
    setAudioStream(stream);

    // 2) MediaRecorder 세팅 (기존 로직)
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.start();
    setRecording(true);

  } catch (err) {
    console.error('마이크 권한 오류:', err);
    alert('녹음 권한이 필요합니다.');
  }
};


  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };


  const handleSubmitRecording = async () => {
    console.log("📦 wavBlob is", wavBlob, "type:", typeof wavBlob);

    if (!wavBlob) {
      alert("먼저 녹음을 완료해 주세요.");
      return;
    }

    const fd = new FormData();
    // study_schedule_id: 지금 보고 있는 스케줄 아이디
    fd.append("study_schedule_id", currentStudyItem.study_schedule_id);
    // answer_file_id: MaterialSearch로 선택한 file_id
    fd.append("answer_file_id", currentStudyItem.file_id);
    // speech_file: 녹음된 WAV 파일
    console.log("currentStudyItem", currentStudyItem);
    fd.append("speech_file", wavBlob, "recording.wav");

    for (let pair of fd.entries()){
      console.log(pair[0] + ':', pair[1]);
    }
    const token = localStorage.getItem("accessToken");
    console.log(token);
    try {
      // ② 맞춤형 채점 API 호출
      const resp = await instance.post(
        "/studys/learn",
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("채점 결과:", resp.data);
      // TODO: resp.data를 상태에 저장하거나, 모달 닫고 UI 갱신
    } catch (err) {
      console.error("채점 API 호출 오류:", err);
      alert("채점 요청에 실패했습니다.");
    }
    // const results = [];

  //   for (let i = 0; i < wavBlobs.length; i++){
  //     const fd = new FormData();
  //     fd.append("file", wavBlobs[i], `recording_${i+1}.wav`);

  //     const token = localStorage.getItem("accessToken");
  //     try {
  //     const resp = await instance.post(
  //       "/stt",
  //       fd,
  //       { headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`
  //         }}
  //     );
  //     // const text = resp.data.text;
  //     // console.log(`STT 결과 [녹음 ${i+1}]`, text);
  //     // results.push(`${text}`)
  //   }  catch(err) {
  //     console.err("STT호출 오류: ", err);
  //     alert("STT 요청에 실패했습니다.");
  //     break;
  //   }
  // } 
    // const combined = results.join("\n");
    // const combined = results.join(" ");
    // console.log(combined);

    //  파일 다운받을 수 있는 부분
    // const blob = new Blob([combined], {type: "text/plain"});
    // const url = URL.createObjectURL(blob);

    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "transcript.txt";
    // a.click();


    setWavBlob([]);
    setAudioUrl(null);
  };

  const handleRestartRecording = () => {
    setWavBlob([]);
    setAudioUrl(null);
    audioChunksRef.current = [];
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

  const handleStartStudy = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await instance.get(
        `/study-schedules/id/${item.study_schedule_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detail = response.data.content;
      
      const studyItem = {
        ...detail,
        subjectName: detail.subject_name,
        materialTitle: detail.file_name
      };

      // console.log("Loaded studyItem: ", studyItem);
      setStudyItem(studyItem);
      openModal('startRecord');
    } catch(err) {
      console.error("스케줄 상세 조회 오류: ", err);
      alert("학습 정보를 불러오는 데 실패하였습니다.");
    }
  }

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
            {/* {console.log('▶ currentStudyItem:', currentStudyItem)} */}
            <h2>{currentStudyItem.subjectName} - {currentStudyItem.materialTitle}</h2>
            <div className="record_img">
              <button 
                onClick={() => openModal('Recording')}>
                <img 
                  src={record} alt="record" className="profile_icon"
                />
              </button>
              <div>학습을 시작하려면 누르세요.</div>
              {/* <div>녹음이 바로 시작됩니다.</div> */}
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
                <div className="Schedule-toggle-btn">
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
            <h2>{currentStudyItem.subjectName} - {currentStudyItem.materialTitle}</h2>
            <RecordingModal2
              // isOpen={ showRecordingModal }
              // onClose={()=> setShowRecordingModal(false)}
              studyItem={currentStudyItem}
              recording={recording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              audioStream = {audioStream}
              onSubmit={handleSubmitRecording}
              onRestart={handleRestartRecording}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}