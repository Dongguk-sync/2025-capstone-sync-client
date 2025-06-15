import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import axios from '../api/axios';
import './DocumentViewPage.css';

export default function DocumentViewPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/answer-files/id/${fileId}`)
      .then(res => {
        console.log('응답 내용:', res.data);
        if (res.data.success && res.data.content) {
          setDoc(res.data.content);
        } else {
          setError('문서를 찾을 수 없습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('문서 로딩 중 오류가 발생했습니다.');
      });
  }, [fileId]);

  if (error) return <div className="document-view-page">{error}</div>;
  if (!doc) return <div className="document-view-page">문서 로딩 중...</div>;

  return (
    <div className="document-view-page">
      <button onClick={() => navigate(-1)} className="back-btn">← 뒤로</button>
      <div className="document-view-title">
        <h2>{doc.file_name}</h2>
        <p><em>최근 학습일: {doc.recent_studied_date || '학습 전'}</em></p>
      </div>

      <div className="scrollable-content">
        {doc.file_content ? (
          <div className="markdown-body">
            <ReactMarkdown>{doc.file_content}</ReactMarkdown>
          </div>
        ) : (
          <p>문서 내용이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
