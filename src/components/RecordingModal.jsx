import React, { useRef, useEffect, useState } from 'react';
// import recordIcon from '../assets/record.png';
import { FaPause } from 'react-icons/fa';
import { MdFiberManualRecord } from 'react-icons/md';
// import './RecordingModalContent.css';

export default function RecordingModalContent({
  recording,
  startRecording,
  stopRecording,
  studyItem
}) {
  const canvasRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // const [stream, setStream] = useState(null);
  const [transcript, setTranscript] = useState('');

  // Clova CSR API 전송
  async function sendToCSR(blob) {
    const url = import.meta.env.VITE_CSR_URL;
    const id = import.meta.env.VITE_CSR_ACCESS_KEY_ID;
    // const secret = import.meta.env.VITE_CSR_SECRET;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-NCP-APIGW-API-KEY-ID': id,
          // 'X-NCP-APIGW-API-KEY': secret
        },
        body: blob
      });
      if (!res.ok) throw new Error(`CSR error ${res.status}`);
      const json = await res.json();
      const text = json.text || json.recognitionResult?.[0]?.transcript || '';
      setTranscript(text);
    } catch (e) {
      console.error('CSR 오류', e);
      setTranscript('음성 인식 실패');
    }
  }

  useEffect(() => {
  let audioCtx, analyser, dataArray, rafId;
  let recorder;

  async function initRecording() {
    // 1) 마이크 스트림 가져오기
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2) MediaRecorder 세팅
    recorder = new MediaRecorder(ms);
    audioChunksRef.current = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      sendToCSR(blob);
    };
    recorder.start();

    // 3) Web Audio API 셋업 (파형 그리기)
    audioCtx = new AudioContext();
    const source  = audioCtx.createMediaStreamSource(ms);
    analyser       = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function draw() {
      rafId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const slice = canvas.width / dataArray.length;
      let x = 0;
      dataArray.forEach((v, i) => {
        const y = (v / 128.0) * canvas.height / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += slice;
      });
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    draw();
  }

  if (recording) {
    initRecording().catch(console.error);
    startRecording();
  } else {
    // 녹음 중지 및 리소스 해제
    recorder?.stop();
    analyser?.disconnect();
    audioCtx?.close();
    cancelAnimationFrame(rafId);
    stopRecording();
  }

  return () => {
    // 컴포넌트 언마운트 시에도 안전하게 정리
    recorder?.stop();
    analyser?.disconnect();
    audioCtx?.close();
    cancelAnimationFrame(rafId);
  };
}, [recording]);


  return (
    <div className="recording-modal-content">
      <h2>{studyItem?.materialTitle || '학습 시작'}</h2>
      <p className="recording-message">최대 10분까지 녹음할 수 있습니다.</p>
      <canvas ref={canvasRef} width={400} height={100} className="waveform-canvas" />
      <div className="record-controls">
        <button onClick={() => recording ? stopRecording() : startRecording()}>
          {recording ? '녹음중': '녹음하기'};
          {/* {recording ? <FaPause size={24} /> : <MdFiberManualRecord size={24} />} */}
        </button>
      </div>
      <div className="transcript-box">
        {transcript || <i>음성 인식 중…</i>}
      </div>
      <div className="modal-buttons">
        <button className="submit-btn">제출하기</button>
        <button className="restart-btn">다시 시작</button>
      </div>
    </div>
  );
}



// // src/components/RecordingModal.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import recordIcon from '../assets/record.png';
// import { FaPause, FaCircle } from 'react-icons/fa';
// import { MdFiberManualRecord } from 'react-icons/md';


// export default function RecordingModalContent({ 
//   recording, 
//   startRecording, 
//   stopRecording, 
//   studyItem 
// }) {
//   const canvasRef = useRef(null);
//   const [stream, setStream] = useState(null);
  
//   useEffect(() => {
//     if (!recording) {
//       // 녹음이 멈추면 캔버스도 비우고, 스트림 트랙을 정리
//       const c = canvasRef.current?.getContext('2d');
//       if (c) c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//       if (stream) {
//         stream.getTracks().forEach(t => t.stop());
//         setStream(null);
//       }
//       return;
//     }
//     let audioCtx, analyser, dataArray, rafId;
//       // 1) 마이크 스트림 가져오기
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(ms => {
//         setStream(ms);

//         // 2) Web Audio API 셋업
//         audioCtx = new AudioContext();
//         const source = audioCtx.createMediaStreamSource(ms);
//         analyser = audioCtx.createAnalyser();
//         analyser.fftSize = 2048;
//         source.connect(analyser);

//         dataArray = new Uint8Array(analyser.fftSize);
//         const canvas = canvasRef.current;
//         const ctx    = canvas.getContext('2d');

//         // 3) 애니메이션 루프에서 파형 그리기
//         function draw() {
//           rafId = requestAnimationFrame(draw);
//           analyser.getByteTimeDomainData(dataArray);

//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           ctx.lineWidth   = 2;
//           ctx.strokeStyle = '#4A90E2';
//           ctx.beginPath();

//           const sliceWidth = canvas.width / dataArray.length;
//           let x = 0;
//           for (let i = 0; i < dataArray.length; i++) {
//             const v = dataArray[i] / 128.0;
//             const y = (v * canvas.height) / 2;
//             if (i === 0) ctx.moveTo(x, y);
//             else         ctx.lineTo(x, y);
//             x += sliceWidth;
//           }
//           ctx.lineTo(canvas.width, canvas.height / 2);
//           ctx.stroke();
//         }
//         draw();
//       })
//       .catch(err => console.error('Waveform init error:', err));
      
//         // 4) 정리(cleanup)
//     return () => {
//       if (rafId)           cancelAnimationFrame(rafId);
//       if (analyser)        analyser.disconnect();
//       if (audioCtx)        audioCtx.close();
//       if (stream) {
//         stream.getTracks().forEach(t => t.stop());
//         setStream(null);
//       }
//     };
//   }, [recording])


//   return (
//     <div>
//       <h2>{studyItem?.materialTitle || '학습 시작'}</h2>
//       <div className="recordingModal">
//         <div className="recording_message">최대 10분까지 눅음할 수 있습니다.</div>
        
//         {/* 파동 */}
//         <canvas
//           ref={canvasRef}
//           width={400}
//           height={100}
//           className="waveform-canvas"
//         />

//         <div className="record_img">
//           <button onClick={recording ? stopRecording : startRecording}>
//             <img src={recordIcon} alt="녹음" className="profile_icon" />
//           </button>
//         </div>
//         {/* 버튼으로 변경 */} 
//         <p>{recording ? <FaPause/>  : <MdFiberManualRecord />}</p>
//         <div className="RecordingButtons">
//           <button
//             className="Submit_btn"
//           >제출하기</button>
//           <button
//             className="Restart_btn"
//           >다시 시작</button>
//         </div>
//       </div>
//     </div>
//   );
// }
