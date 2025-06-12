import {  FaBook } from 'react-icons/fa';
import { useEffect } from 'react';
import '../pages/FeedbackPage.css';

export default function SidebarFeedback({
  documents,
  selectedDocument,
  setSelectedDocument,
  selectedHistory,
  setSelectedHistory,
  docId,
  historyIndex,
}) 
  {
    useEffect(() => {
      if (!selectedDocument && docId && documents.length > 0) {
        const doc = documents.find(d => d.id === Number(docId));
        if (doc) {
          setSelectedDocument(doc);
          const history = doc.histories[Number(historyIndex)];
          if (history) {
            setSelectedHistory(history);
          }
        }
      }
    }, [docId, historyIndex, documents]);

    
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">학습 교안</h2>
      <ul className="folder-list">
        {documents.map(document => (
          <li key={document.id}>
            {/* 교안 */}
            <button
              className={`folder-label ${selectedDocument?.id === document.id ? 'active' : ''}`}
              onClick={() => setSelectedDocument(document)}
            >
              <FaBook className="book-icon" />
              <span>{document.name}</span>
            </button>

            {/* 회차 */}
            {selectedDocument?.id === document.id && (
              <ul className="history-list">
                {document.histories.map((history, index) => (
                  <li key={index}>
                    <button
                      className={`history-item ${selectedHistory === history ? 'active' : ''}`}
                      onClick={() => setSelectedHistory(history)}
                    >
                      {history}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
