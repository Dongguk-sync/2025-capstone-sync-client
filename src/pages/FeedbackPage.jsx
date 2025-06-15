import React, { useEffect, useState, useRef } from 'react';
import Header from "../components/Header";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SidebarFeedback from '../components/SidebarFeedback';
import FeedbackChatBox from '../components/FeedbackChatBox';
import axios from '../api/axios';
import './FeedbackPage.css';

export default function FeedbackPage() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    file_id,
    file_name,
    subject_id,
    subject_name,
    latestRound,
    studyArr
  } = location.state || {};

  const [documents, setDocuments] = useState(file_id && file_name ? [{
    file_id,
    file_name,
    subject_id,
    subject_name,
    recent_studied_date: studyArr?.[0]?.recent_studied_date || null,
    histories: studyArr ? studyArr.map(item => item.studys_round).sort((a, b) => a - b) : []
  }] : []);

  const [selectedDocument, setSelectedDocument] = useState(file_id && file_name ? {
    file_id,
    file_name,
    subject_id,
    subject_name,
    recent_studied_date: studyArr?.[0]?.recent_studied_date || null,
    histories: studyArr ? studyArr.map(item => item.studys_round).sort((a, b) => a - b) : []
  } : null);

  const [selectedHistory, setSelectedHistory] = useState(latestRound || null);
  const [studysList, setStudysList] = useState([]);
  const [selectedStudysId, setSelectedStudysId] = useState(null);

  const chatTopRef = useRef(null);

  const handleScrollToTop = () => {
    if (chatTopRef.current) {
      chatTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
    // 문서 목록 로딩
  useEffect(() => {
    if (!file_id && subjectId) {
      axios.get(`/answer-files/subject-id/${subjectId}`)
        .then(async res => {
          const docListRaw = res.data.content || [];
          const docList = await Promise.all(docListRaw.map(async doc => {
          let histories = [];
          try {
            const studyRes = await axios.get(`/studys/file-id/${doc.file_id}`);
            histories = [
              ...new Set((studyRes.data.content || []).map(item => item.studys_round))
            ].sort((a, b) => a - b);
          } catch (err) {
            console.error('회차 불러오기 실패:', err);
          }
          return {
            file_id: doc.file_id,
            file_name: doc.file_name,
            subject_id: doc.subject_id,
            subject_name: doc.subject_name,
            recent_studied_date: doc.recent_studied_date || null,
            histories
          };
        }));
          setDocuments(docList);
          if (docList.length > 0) setSelectedDocument(docList[0]);
        });
    }
  }, [file_id, subjectId]);

  // 문서 목록 로딩
  // useEffect(() => {
  //   if (!file_id && subjectId) {
  //     axios.get(`/answer-files/subject-id/${subjectId}`)
  //       .then(async res => {
  //         const docListRaw = res.data.content || [];
  //         const docList = await Promise.all(docListRaw.map(async doc => {
  //           let histories = [];
  //           try {
  //             const studyRes = await axios.get(`/studys/file-id/${doc.file_id}`);
  //             histories = (studyRes.data.content || []).map(item => item.studys_round).sort((a, b) => a - b);
  //           } catch (err) {
  //             console.error('회차 불러오기 실패:', err);
  //           }
  //           return {
  //             file_id: doc.file_id,
  //             file_name: doc.file_name,
  //             subject_id: doc.subject_id,
  //             subject_name: doc.subject_name,
  //             recent_studied_date: doc.recent_studied_date || null,
  //             histories
  //           };
  //         }));
  //         setDocuments(docList);
  //         if (docList.length > 0) setSelectedDocument(docList[0]);
  //       });
  //   }
  // }, [file_id, subjectId]);

  // studysList 불러오기
  useEffect(() => {
    if (selectedDocument?.file_id) {
      axios.get(`/studys/file-id/${selectedDocument.file_id}`)
        .then(res => {
          const studyArr = res.data.content || [];
          setStudysList(studyArr);

          if (!selectedHistory && studyArr.length > 0) {
            const latestRound = studyArr[studyArr.length - 1].studys_round;
            setSelectedHistory(latestRound);
          }
        })
        .catch(err => console.error("학습 정보 불러오기 실패:", err));
    }
  }, [selectedDocument?.file_id, selectedHistory]);

  // studys_round → studys_id 매핑
  useEffect(() => {
    if (selectedHistory != null && studysList.length > 0) {
      const match = studysList.find(item => item.studys_round === selectedHistory);
      setSelectedStudysId(match?.studys_id || null);
    }
  }, [selectedHistory, studysList]);

  return (
    <div className="feedback-page">
      <Header />
      <SidebarFeedback
        documents={documents}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        selectedHistory={selectedHistory}
        setSelectedHistory={setSelectedHistory}
      />

      <div className="feedback-main">
        {/* 상단 헤더 */}
        <div className="feedback-top">
          <div className="feedback-header-info">
            <h2>{selectedDocument?.file_name || '교안명 없음'} 의 학습 결과입니다.</h2>
            <button className="scroll-top-btn" onClick={handleScrollToTop}>
              학습 결과 보기
            </button>
            <button 
              onClick={() =>{
                navigate(-1);
                // navigate(0);
                // window.location.reload();
              }} 
              className="out-btn">나가기</button>
          </div>
        </div>

        {/* 채팅 영역 */}
        <FeedbackChatBox
          fileId={selectedDocument?.file_id}
          history={selectedHistory}
          studysId={selectedStudysId}  // studys_id 전달
          chatTopRef={chatTopRef}
        />
      </div>
    </div>
  );
}
