// src/components/DocumentList.jsx
import React, { useState } from 'react';
import { FaTrash, FaCheck, FaPencilAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import '../pages/DocumentManagementPage.css';

export default function DocumentList({
  documents,
  onViewDoc,
  onViewResult,
}) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);


  const totalPages = Math.ceil((documents?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocs = (documents || []).slice(startIndex, startIndex + itemsPerPage);
  
  

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (!documents || documents.length === 0)
    return <div>등록된 문서가 없습니다.</div>;

  return (
    <>
      <table className="doc-table">
        <thead>
          <tr>
            <th></th>
            <th style={{ textAlign: 'center' }}>교안명</th>
            <th style={{ textAlign: 'center' }}>최근 학습일</th>
            <th style={{ textAlign: 'center' }}>교안</th>
            <th style={{ textAlign: 'center' }}>학습결과</th>
          </tr>
        </thead>
        <tbody>
          {currentDocs.map(doc => {
            const studied = doc.recent_studied_date && !isNaN(new Date(doc.recent_studied_date));
            return (
              <tr key={doc.file_id}>
                <td className="status-icon">
                  {studied
                    ? <FaCheck className="icon-completed" />
                    : <FaPencilAlt className="icon-new" />
                  }
                </td>
                <td style={{ textAlign: 'center' }}>{doc.file_name}</td>
                <td style={{ textAlign: 'center' }}>
                  {studied
                    ? new Date(doc.recent_studied_date).toLocaleDateString()
                    : '학습 전'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="link-btn" onClick={() => onViewDoc(doc)}>
                    교안 보기
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {studied
                    ? (
                      <button className="link-btn" onClick={() => onViewResult(doc)}>
                        결과 보기
                      </button>
                    )
                    : '-'
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className="pagination-text">
          <span
            className={`page-link ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => goToPage(currentPage - 1)}
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
            onClick={() => goToPage(currentPage + 1)}
          >
            다음 &raquo;
          </span>
        </nav>
      )}
    </>
  );
}

DocumentList.propTypes = {
  documents:        PropTypes.array.isRequired,
  onViewDoc:        PropTypes.func.isRequired,
  onViewResult:     PropTypes.func.isRequired,
};
