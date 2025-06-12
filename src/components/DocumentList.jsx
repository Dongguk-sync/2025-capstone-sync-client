// DocumentList.jsx
 
import React, { useState } from 'react';
import { FaTrash, FaCheck, FaPencilAlt } from 'react-icons/fa';

import '../pages/DocumentManagementPage.css';

export default function DocumentList({ documents, onViewDoc, onViewResult, onDeleteDocument }) {
  // 페이지당 항목 수 설정
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  // 현재 페이지에 맞는 문서만 슬라이스
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocs = documents.slice(startIndex, startIndex + itemsPerPage);

  // 페이지 이동 핸들러
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };



  return (
    <>
      <table className="doc-table">
        <thead>
          <tr>
            <th></th>
            <th><div style={{ textAlign: 'center' }}>교안명</div></th>
            <th><div style={{ textAlign: 'center' }}>최근 학습일</div></th>
            <th><div style={{ textAlign: 'center' }}>교안</div></th>
            <th><div style={{ textAlign: 'center' }}>학습결과</div></th>
            <th><div style={{ textAlign: 'center' }}>교안삭제</div></th>
          </tr>
        </thead>
        <tbody>
          {currentDocs.map(doc => (
            <tr key={doc.id}>
              <td className="status-icon">
                {doc.status === 'completed' ? (
                  <FaCheck className="icon-completed" />
                ) : (
                  <FaPencilAlt className="icon-new" />
                )}
              </td>
              <td><div style={{ textAlign: 'center' }}>{doc.name}</div></td>
              <td>
                <div style={{ textAlign: 'center' }}>
                  {doc.status === 'completed' ? doc.lastStudyDate : '학습 전'}
                </div>
              </td>
              <td><div style={{ textAlign: 'center' }}><button className="link-btn" onClick={() => onViewDoc(doc.id)}>교안 보기</button></div></td>
              <td><div style={{ textAlign: 'center' }}>
                {doc.status === 'completed' ? (
                  <button className="link-btn" onClick={() => onViewResult(doc.id)}>결과 보기</button>

                ) : (
                  '-'
                )}
              </div></td>           
              <td><div style={{ textAlign: 'center' }}>
                 <button className="delete-btn" onClick={() => onDeleteDocument(doc.id)}>
                  < FaTrash />
                </button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
  <nav className="pagination-text">
    <span
      className={`page-link ${currentPage === 1 ? 'disabled' : ''}`}
      onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
    >
      &laquo; 이전
    </span>
    {Array.from({ length: totalPages }, (_, i) => (
      <span
        key={i + 1}
        className={`page-link${currentPage === i + 1 ? ' active' : ''}`}
        onClick={() => goToPage(i + 1)}
      >
        {i + 1}
      </span>
    ))}
    <span
      className={`page-link ${currentPage === totalPages ? 'disabled' : ''}`}
      onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
    >
      다음 &raquo;
    </span>
  </nav>
)}


    </>
  );
}