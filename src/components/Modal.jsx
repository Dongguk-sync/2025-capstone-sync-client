// src/components/Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.body
  )

  // return ReactDOM.createPortal(
  //   <>
  //     {/* 헤더 밑부터 화면 끝까지 덮는 반투명 오버레이 */}
  //     <div className="modal-overlay" onClick={onClose} />

  //     {/* 화면 중앙에 고정된 모달 박스 */}
  //     <div className="modal-window">
  //       <button className="modal-close" onClick={onClose}>×</button>
  //       {children}
  //     </div>
  //   </>,
  //   document.body
  // );
}
