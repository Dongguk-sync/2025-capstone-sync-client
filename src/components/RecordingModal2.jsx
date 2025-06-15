import '../pages/MainPage.css';

// RecordingModal2.jsx
import React, {useEffect, useRef, useState} from 'react';
import {FaPause, FaPlay} from 'react-icons/fa'

export default function RecordingModal2({
  recording,
  startRecording,
  stopRecording,
  // audioUrl,
  audioStream,
  onSubmit,
  onRestart
}) {

  const canvasRef = useRef(null);
  const [audioCtx, setAudioCtx] = useState(null);

  const [seconds, setSeconds] = useState(0);

    useEffect(() => {
    if (!audioStream) return;
    // 1) AudioContext, Analyser 세팅
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(audioStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;  // 해상도 조정
    source.connect(analyser);
    setAudioCtx({ ctx, analyser });

    return () => { 
      ctx.close();
      setAudioCtx(null);
    };
  }, [audioStream]);

  useEffect(() => {
    // if (!audioCtx) return;
    // const { ctx, analyser } = audioCtx;
    // const canvas = canvasRef.current;
    // const height = canvas.height;
    // const width = canvas.width;
    // const barWidth = width / analyser.frequencyBinCount;
    // const dataArray = new Uint8Array(analyser.frequencyBinCount);
    // const draw = () => {
    //   analyser.getByteFrequencyData(dataArray);
    //   const c = canvas.getContext("2d");
    //   c.clearRect(0, 0, width, height);
    //   // 각 빈(bin)마다 막대 그리기
    //   dataArray.forEach((v, i) => {
    //     const barHeight = (v / 255) * height;
    //     c.fillStyle = "#333";
    //     c.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    //   });
    //   // 녹음 중일 때만 loop
    //   if (recording) requestAnimationFrame(draw);
    // };
    // draw();
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    if(!audioCtx || !recording) {
      c.clearRect(0,0,width,height);
      return;
    }

    const {analyser} = audioCtx;
    const barWidth = width / analyser.frequencyBinCount;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      c.clearRect(0,0,width,height);
      dataArray.forEach((v,i) => {
        const barHeight = (v / 255) * height;
        c.fillStyle="#333";
        c.fillRect(i * barWidth, height - barHeight, barWidth -1, barHeight);
      });
      if(recording) {
        requestAnimationFrame(draw);
      }
    };
    if(recording) draw();

    return () => {
      c.clearRect(0,0,width,height);
    }
  }, [audioCtx, recording]);


  useEffect(() => {
    let timer;
    if (recording) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [recording]);

  const formatTime = secs => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m} : ${s}`;
  };

  return (
    <div className="recording-modal">
      <p className="hint">최대 10분까지 녹음할 수 있습니다.</p>

      <div className="timer">{formatTime(seconds)}</div>

      {/* <div className="waveform">{bars}</div> */}
      <canvas ref={canvasRef} width={300} height={80} className="wave-canvas" />


      <button
        onClick={recording ? stopRecording : startRecording}
        className="toggle-btn"
      >
        {recording ? <FaPause size={28} /> : <FaPlay size={28} />}
      </button>

      <div className="actions">
        <button 
          className="submit-btn" 
          onClick={onSubmit}
        >
          제출하기
        </button>
        <button
          className="restart-btn"
          onClick={() => {
            setSeconds(0);
            onRestart();
          }}
        >
          다시 시작
        </button>
      </div>
    </div>
  );
}
