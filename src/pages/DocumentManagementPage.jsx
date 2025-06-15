// src/pages/DocumentManagementPage.jsx
import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SidebarManagement from "../components/SidebarManagement";
import DocumentList from "../components/DocumentList";
import Modal from "../components/Modal";
import UploadIcon from "../assets/upload.png";
import axios, { getCurrentUser } from "../api/axios";
import "github-markdown-css";
import "./DocumentManagementPage.css";

export default function DocumentManagementPage() {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const activeFolderName = activeFolder === "all"
  ? "학습 기록 및 교안 관리"
  : folders.find((f) => f.id === activeFolder)?.name || "학습 기록 및 교안 관리";

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.content.user_id);
      } catch (error) {
        console.error("유저 정보 로딩 실패:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const folderRes = await axios.get(`/subjects/user-id/${userId}`);
        setFolders(
          (folderRes.data.content || []).map((f) => ({
            id: f.subject_id,
            name: f.subject_name,
          }))
        );
      } catch (error) {
        console.error("과목 목록 로딩 실패:", error);
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!activeFolder) return;
    (async () => {
      try {
        let docRes;
        if (activeFolder === "all") {
          docRes = await axios.get(`/answer-files/user-id/${userId}`);
        } else {
          docRes = await axios.get(`/answer-files/subject-id/${activeFolder}`);
        }
        setDocuments(docRes.data.content || []);
      } catch (error) {
        console.error("교안 목록 로딩 실패:", error);
      }
    })();
  }, [activeFolder, userId]);



  const handleViewDoc = (doc) => {
    navigate(`/subjects/${doc.subject_id}/files/${doc.file_id}`);
  };

  const handleViewResult = async (doc) => {
    try {
      const res = await axios.get(`/studys/file-id/${doc.file_id}`);
      const studyArr = res.data.content || [];
      const latestRound = Math.max(...studyArr.map(item => item.studys_round));
      const latestStudy = studyArr.find(item => item.studys_round === latestRound);

      if (!latestStudy) {
        alert("학습 결과가 없습니다.");
        return;
      }

      let subjectName = doc.subject_name;
      if (!subjectName && folders) {
        const folder = folders.find(f => f.id === doc.subject_id);
        subjectName = folder ? folder.name : '';
      }

      navigate(`/feedback/${doc.file_id}/${latestRound}`, {
        state: {
          file_id: doc.file_id,
          file_name: doc.file_name,
          subject_id: doc.subject_id,
          subject_name: subjectName,
          latestRound,
          studyArr,
        }
      });
    } catch (err) {
      console.error("피드백 로딩 실패:", err);
      alert("피드백을 불러오는데 실패했습니다.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || activeFolder === "all") return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", userId);
      formData.append("subject_id", Number(activeFolder));

      const token = localStorage.getItem("accessToken");

      await axios.post("/answer-files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const docRes =
        activeFolder === "all"
          ? await axios.get(`/answer-files/user-id/${userId}`)
          : await axios.get(`/answer-files/subject-id/${activeFolder}`);
      setDocuments(docRes.data.content || []);
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setShowAddModal(false);
      setSelectedFile(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setSelectedFile(e.dataTransfer.files[0]);
  };
  const onFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const filteredDocs = (documents || [])
    .filter((d) => !!d && typeof d === "object")
    .filter((d) => activeFolder === "all" || d.subject_id === Number(activeFolder))
    .filter((d) => d.file_name && d.file_name.toLowerCase().includes(searchTerm.toLowerCase()));


  return (
    <div className="document-management-page">
      <Header />
      <SidebarManagement
        userId={userId}
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onAddFolder={(nf) => {
          setFolders([nf, ...folders]);
          setActiveFolder(nf.id);
      }
        }
        
        onEditFolder={(id, newName) =>
          setFolders((prev) =>
            prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
          )
        }
      />

      <main className="main-content">
        <header className="page-header">
          <h1>{activeFolderName}</h1>
          <p className="summary">학습 총 {filteredDocs.length}개</p>
        </header>

        <div className="toolbar">
          <button
            className="add-doc-btn"
            onClick={() => setShowAddModal(true)}
            style={{
              visibility: activeFolder === "all" ? "hidden" : "visible",
            }}
          >
            <FaPlus /> 교안 추가
          </button>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DocumentList
          userId={userId}
          documents={filteredDocs}
          activeFolder={activeFolder}
          onViewDoc={handleViewDoc}
          onViewResult={handleViewResult}
        />

        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            overlayClassName="modal-overlay"
            className="modal-content addDocument"
          >
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              ×
            </button>
            {isUploading ? (
              <div className="upload-loading">⏳ 파일 업로드 중입니다...</div>
            ) : (
              <>
            <div className="modal-title">
              <h2>교안 추가</h2>
              <p>아래에 교안파일을 첨부하세요</p>
            </div>
                <div
                  className={`drop-zone ${dragOver ? "over" : ""}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  {selectedFile ? (
                    <p>{selectedFile.name}</p>
                  ) : (
                    <>
                      <p>파일을 업로드하세요</p>
                      <p>Format: docx, doc, pdf, txt</p>
                      <img src={UploadIcon} alt="upload" className="upload-icon" />
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={onFileChange}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>
                <button className="modal-submit" onClick={handleUpload}>
                  완료
                </button>
              </>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
}
