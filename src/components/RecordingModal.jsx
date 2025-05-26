// src/components/RecordingModal.jsx
//import React, { useState, useRef, useEffect } from 'react';
import recordIcon from '../assets/record.jpg';

export default function RecordingModalContent({ recording, startRecording, stopRecording, studyItem }) {
  return (
    <>
      <h2>{studyItem?.materialTitle || '학습 시작'}</h2>
      <div className="record_img">
        <button onClick={recording ? stopRecording : startRecording}>
          <img src={recordIcon} alt="녹음" className="profile_icon" />
        </button>
      </div>
      <p>{recording ? '녹음 중…' : '버튼을 눌러 녹음을 시작하세요'}</p>
      <button>제출하기</button>
      <button>다시 시작</button>
    </>
  );
}
