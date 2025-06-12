import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import useLocalStorage from '../hooks/useLocalStorage';
import './DocumentViewPage.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function DocumentViewPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [documents] = useLocalStorage('documents', []);
  const doc = documents.find(d => d.id === Number(docId));

  if (!doc) return <div className="document-view-page">문서를 찾을 수 없습니다.</div>;
  
  return (
    <div className="document-view-page">
      <button onClick={() => navigate(-1)} className="back-btn">← 뒤로</button>
      <div className="document-view-title">
      <h2>{doc.name}</h2>
      <p><em>최근 학습일: {doc.lastStudyDate || '학습 전'}</em></p>
      </div>

      <div className="scrollable-content">
        {doc.content && Array.isArray(doc.content) ? (
            <div className="markdown-body">
            {doc.content.map((section, idx) => (
                <ReactMarkdown key={idx}>{section}</ReactMarkdown>
            ))}
            </div>
        ) : doc.fileUrl ? (
            <div>
            <Document file={doc.fileUrl} onLoadError={console.error}>
                <Page pageNumber={1} width={600} />
            </Document>
            </div>
        ) : (
            <p>문서를 불러올 수 없습니다.</p>
        )}
        </div>
    </div>
  );
}
