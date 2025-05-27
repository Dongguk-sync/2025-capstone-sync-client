// src/components/RecordingModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import recordIcon from '../assets/record.png';
import { FaPause, FaCircle } from 'react-icons/fa';
import { MdFiberManualRecord } from 'react-icons/md';


export default function RecordingModalContent({ 
  recording, 
  startRecording, 
  stopRecording, 
  studyItem 
}) {
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  useEffect(() => {
    if (!recording) {
      // 녹음이 멈추면 캔버스도 비우고, 스트림 트랙을 정리
      const c = canvasRef.current?.getContext('2d');
      if (c) c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      return;
    }
    let audioCtx, analyser, dataArray, rafId;
      // 1) 마이크 스트림 가져오기
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(ms => {
        setStream(ms);

        // 2) Web Audio API 셋업
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(ms);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        dataArray = new Uint8Array(analyser.fftSize);
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');

        // 3) 애니메이션 루프에서 파형 그리기
        function draw() {
          rafId = requestAnimationFrame(draw);
          analyser.getByteTimeDomainData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.lineWidth   = 2;
          ctx.strokeStyle = '#4A90E2';
          ctx.beginPath();

          const sliceWidth = canvas.width / dataArray.length;
          let x = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else         ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
        draw();
      })
      .catch(err => console.error('Waveform init error:', err));
      
        // 4) 정리(cleanup)
    return () => {
      if (rafId)           cancelAnimationFrame(rafId);
      if (analyser)        analyser.disconnect();
      if (audioCtx)        audioCtx.close();
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    };
  }, [recording])


  return (
    <div>
      <h2>{studyItem?.materialTitle || '학습 시작'}</h2>
      <div className="recordingModal">
        <div className="recording_message">최대 10분까지 눅음할 수 있습니다.</div>
        
        {/* 파동 */}
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="waveform-canvas"
        />
        
        <div className="record_img">
          <button onClick={recording ? stopRecording : startRecording}>
            <img src={recordIcon} alt="녹음" className="profile_icon" />
          </button>
        </div>

        <p>{recording ? <FaPause/>  : <MdFiberManualRecord />}</p>
        <div className="RecordingButtons">
          <button
            className="Submit_btn"
          >제출하기</button>
          <button
            className="Restart_btn"
          >다시 시작</button>
        </div>
      </div>
    </div>
  );
}
