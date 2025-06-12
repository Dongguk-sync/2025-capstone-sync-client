// src/pages/DocumentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SidebarManagement from '../components/SidebarManagement';
import DocumentList from '../components/DocumentList';
import Modal from '../components/Modal';
import UploadIcon from '../assets/upload.png';
import axios from 'axios';
import { getCurrentUser } from '../api/axios';

// react-pdf 설정
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import ReactMarkdown from 'react-markdown';
import 'github-markdown-css'; // Markdown CSS
import './DocumentManagementPage.css';

export default function DocumentManagementPage() {
  const navigate = useNavigate(); // ← useNavigate 훅
  // ─ 상태 정의 ────────────────────────────────────────────────
  const [activeFolder, setActiveFolder] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');


  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        const userId = user.user_id;

        // 교안 리스트 요청
        const docRes = await axios.get(`/answer-files/subject-id/${userId}`);
        setDocuments(docRes.data);

        // 교안 리스트 요청
        const folderRes = await axios.get(`/subjects/user-id/${userId}`); // 백엔드 URL에 맞게 수정
            setFolders(folderRes.data);
            } catch (error) {
          console.error('데이터 로딩 실패:', error);
        }
     }
    fetchData();
  }, []);
  // ─ 이벤트 핸들러 ─────────────────────────────────────────────
  // 교안 삭제
  const handleDeleteDocument = async (id) => {
    if (!window.confirm('교안을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/answer-files/id/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 폴더 삭제 (내부 교안도 함께)
  const handleDeleteFolder = async (id) => {
    if (!window.confirm('과목을 삭제하시겠습니까? 해당 과목의 모든 교안도 삭제됩니다.')) return;
    setFolders(prev => prev.filter(f => f.id !== id));
    try {
      await axios.delete(`/subjects/id/${id}`);
      setDocuments(prev => prev.filter(d => d.subject_id !== id));
      if (activeFolder === id) setActiveFolder('all');
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // "교안 보기" 클릭 -> 교안 페이지로 이동
  const handleViewDoc = id => {
  navigate(`/document/${id}`);
};

  // ─── "결과 보기" 클릭 -> 피드백 페이지로 이동 ───
  const handleViewResult = id => {
    const doc = documents.find(d => d.id === id);
    if (!doc || !Array.isArray(doc.histories) || doc.histories.length === 0) {
      alert('피드백 기록이 없습니다.');
      return;
    }
    // React Router의 navigate를 써서 /feedback/:docId 로 이동
    // const latestIndex = doc.histories.length - 1;
    // navigate(`/feedback/${id}/${latestIndex}`);
  };

  // 교안 업로드
  const handleUpload = async () => {
    if (!selectedFile || activeFolder === 'all') return;
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('subject_id', activeFolder);  // 현재 선택된 폴더 ID
        formData.append('name', selectedFile.name.replace(/\.[^/.]+$/, ''));

        const res = await axios.post('/api/answer-files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setDocuments(prev => [res.data, ...prev]); // 서버가 저장된 객체를 반환
        setShowAddModal(false);
        setSelectedFile(null);
      } catch (error) {
        console.error('업로드 실패:', error);
      }
    };

  // 드래그&드롭
  const onDragOver   = e => { e.preventDefault(); setDragOver(true); };
  const onDragLeave  = e => { e.preventDefault(); setDragOver(false); };
  const onDrop       = e => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0]); };
  const onFileChange = e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); };

  // 필터링 부분
  // const filteredDocs = documents
  //   .filter(d => activeFolder === 'all' || d.subject_id === activeFolder)
  //   .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 헤더 타이틀
  const headerTitle =
    activeFolder === 'all'
      ? '학습 기록 및 교안 관리'
      : (folders.find(f => f.id === activeFolder)?.name || '학습 기록 및 교안 관리');

  // 렌더링 
  return (
    <div className="document-management-page">
      <SidebarManagement
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onAddFolder={nf => setFolders([nf, ...folders])}
        onEditFolder={(id, newName) =>
          setFolders(prev => prev.map(f => f.id===id ? {...f, name: newName} : f))
        }
        onDeleteFolder={handleDeleteFolder}
      />

      <main className="main-content">
        <header className="page-header">
          <h1>{headerTitle}</h1>
          {/* <p className="summary">학습 총 {filteredDocs.length}개</p> */}
        </header>

        <div className="toolbar">
          <button
            className="add-doc-btn"
            onClick={() => setShowAddModal(true)}
            style={{ visibility: activeFolder==='all'?'hidden':'visible' }}
          >
            <FaPlus /> 교안 추가
          </button>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* <DocumentList
          documents={filteredDocs}
          onViewDoc={handleViewDoc}
          onViewResult={handleViewResult}
          onDeleteDocument={handleDeleteDocument}
        /> */}

        {/* 교안 추가 모달 */}
        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            overlayClassName="modal-overlay"
            className="modal-content addDocument"
          >
            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            <div className="modal-title">
              <h2>교안 추가</h2>
              <p>아래에 교안파일을 첨부하세요</p>
            </div>
            <div
              className={`drop-zone ${dragOver?'over':''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {selectedFile 
                ? <p>{selectedFile.name}</p>
                : <>
                    <p>파일을 업로드하세요</p>
                    <p>Format: pdf, doc, docx | Max file size: 25 MB</p>
                    <img src={UploadIcon} alt="upload" className="upload-icon"/>
                  </>
              }
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={onFileChange}
                style={{
                  position:'absolute', top:0, left:0,
                  width:'100%', height:'100%',
                  opacity:0, cursor:'pointer'
                }}
              />
            </div>
            <button className="modal-submit" onClick={handleUpload}>완료</button>
          </Modal>
        )}
      </main>
    </div>
  );
}
