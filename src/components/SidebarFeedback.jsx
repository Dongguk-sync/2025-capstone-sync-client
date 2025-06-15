// SidebarFeedback.jsx
import { FaBook } from 'react-icons/fa';
import '../pages/FeedbackPage.css';

export default function SidebarFeedback({
  documents,
  selectedDocument,
  setSelectedDocument,
  selectedHistory,
  setSelectedHistory,
}) {
  // 교안 선택 시 회차 자동 선택
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    // 가장 최근 회차로 선택
    if (document.histories && document.histories.length > 0) {
      const latest = [...document.histories].sort((a, b) => b - a)[0];
      setSelectedHistory(latest);
    } else {
      setSelectedHistory(null);
    }
  };

  return (
    <aside className="sidebar-feedback">
      <h2 className="sidebar-title">학습 결과</h2>
      <ul className="folder-list">
        {documents.map(document => (
          <li key={document.file_id}>
            {/* 교안 버튼 */}
            <button
              className={`folder-label ${selectedDocument?.file_id === document.file_id ? 'active' : ''}`}
              onClick={() => handleSelectDocument(document)}
            >
              <FaBook className="book-icon" />
              <span>{document.file_name}</span>
            </button>

            {/* 회차 목록 */}
            {selectedDocument?.file_id === document.file_id && (
              <ul className="history-list">
                {(document.histories || []).length > 0 ? (
                  document.histories.map((history, idx) => (
                    <li key={idx}>
                      <button
                        className={`history-item ${selectedHistory === history ? 'active' : ''}`}
                        onClick={() => setSelectedHistory(history)}
                      >
                        {history}회차
                      </button>
                    </li>
                  ))
                ) : (
                  <li><span>회차 없음</span></li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
