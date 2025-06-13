// ProgressModal.jsx
import React from 'react';
// import "./ProgressModal.css";

export default function ProgressModal({ open, progress }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>채점하는 중 …</h3>
        <p>최대 2분까지 소요될 수 있습니다</p>
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-label">{progress}%</span>
      </div>
    </div>
  );
}
