
import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackChatBox from '../components/FeedbackChatBox';
import SidebarFeedback from '../components/SidebarFeedback';
import { useEffect } from 'react';
import './FeedbackPage.css';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function FeedbackPage() {
  const chatTopRef = useRef(null);
  const { docId, historyIndex } = useParams();
  const navigate = useNavigate();

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);


  const documents = [
    {
      id: 1,
      name: '자료구조와 실습',
      histories: ['1회차', '2회차', '3회차'],
    },
    // ... 문서 (상수) 
  ];

  const scrollToFeedbackTop = () => {
    if (chatTopRef.current) {
      chatTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  useEffect(() => {
    const doc = documents.find(d => d.id === Number(docId));
    if (doc) {
      setSelectedDocument(doc);
      const index = Number(historyIndex);
      if (!isNaN(index) && doc.histories[index]) {
        setSelectedHistory(doc.histories[index]);
      }
    }
  }, [docId, historyIndex, documents]);


  return (
    <div className="feedback-page">
      <SidebarFeedback
        documents={documents}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        selectedHistory={selectedHistory}
        setSelectedHistory={setSelectedHistory}
        docId={docId}
        historyIndex={historyIndex}
      />
      <div className="feedback-main">
      <div className="feedback-top">
        {selectedDocument && selectedHistory ? (
          <div className="result-box">
            <h3>{selectedDocument.name} - {selectedHistory}</h3>
          </div>
        ) : (
          <p>학습 회차를 선택해주세요.</p>
        )}

        <div className="feedback-header-info">
          <p>문서 ID: {docId}, {historyIndex}회차</p>
          <p>7. Linked List - 학습 일시: 2025.06.05</p>
        </div>
        <div className="feedback-button-group">
        <button onClick={scrollToFeedbackTop} className="scroll-button">
          학습 결과 보기
        </button>
        <button onClick={() => navigate(-1)}>뒤로 가기</button>
        </div>
      </div>

      <FeedbackChatBox scrollTarget={chatTopRef} />
    </div>
    </div>
  );
}
