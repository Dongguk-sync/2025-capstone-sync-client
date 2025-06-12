// RecordingModal2.jsx
import React from 'react';

export default function RecordingModal2({
  isOpen,
  onClose,
  recording,
  startRecording,
  stopRecording,
  audioUrl
}) {
  // isOpen이 false면 아예 렌더링 하지 않음
  if (isOpen) return null;

  return (
    <div className="recording-modal">
      <button onClick={onClose} className="close-btn">×</button>
      <h2>{recording ? '녹음 중...' : '준비 완료'}</h2>

      <button
        onClick={recording ? stopRecording : startRecording}
        className="record-toggle"
      >
        {recording ? '녹음 중지' : '녹음 시작'}
      </button>

      {audioUrl && (
        <div className="playback">
          <h3>미리 듣기</h3>
          <audio src={audioUrl} controls />
        </div>
      )}
    </div>
  );
}
