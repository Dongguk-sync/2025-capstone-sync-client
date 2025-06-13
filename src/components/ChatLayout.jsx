import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import {
  fetchUserHistories,
  fetchSessionMessages,
  fetchChatbotResponse
} from '../services/ChatService';
import './ChatLayout.css';
import Header from "../components/Header";
import { FaRegSquare } from 'react-icons/fa';
import { getCurrentUser } from '../api/axios';

// 첫 번째 사용자 발화 기준 단순 요약 함수
async function generateSummary(messages) {
  if(!Array.isArray(messages) || messages.length === 0){
    return '';
  }
  const firstUser = messages.find(
    m => m.from === 'user' && typeof m.text === 'string' && m.text.trim() !== '');
  
    if (!firstUser) return '';

  const text = firstUser.text.trim();
  return text.length > 30 ? text.slice(0, 30) + '...' : text;
}

export default function ChatLayout() {
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  // ── 관련 교안 페이지로 이동 ──
    const handleNavigateToDoc = (docId, historyIndex) => {
      navigate(`/feedback/${docId}/${historyIndex}`);
    };

  // ── 세션 선택 시: 메시지 로드 ──
  const handleSelectSession = useCallback(async (sessionId) => {
    try {
      const raw = await fetchSessionMessages(sessionId);
      // console.log('fetchSessionMessages raw: ', raw);

      const dataArray = Array.isArray(raw)
        ? raw
        :Array.isArray(raw.content)
          ? raw.content
          : [];
      // console.log('messages array: ', dataArray);

      const msgs = dataArray.map(m => ({
        from: m.message_type === 'AI' ? 'bot' : 'user',
        text: m.message_content,
        timestamp: m.timestamp_create_at
      }));
      // console.log('mapped msg: ', msgs);

      const summary = await generateSummary(msgs);

      setSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, messages: msgs, title: summary } 
            // ? {...s, message: msgs}
            : s
          )
        );
      setCurrentId(sessionId);
    } catch (err) {
      console.error('세션 메시지 로드 실패', err);
    }
  }, []);
  useEffect(() => {
  async function loadHistories() {
    try {
      // 1) 실제 로그인된 유저 정보 가져오기
      const userRes = await getCurrentUser();
      const userId = userRes.content.user_id;

      // 2) 해당 유저의 히스토리 불러오기
      const histories = await fetchUserHistories(userId);
      const histArray = Array.isArray(histories) ? histories : histories.content;

      // 3) 세션 상태 셋업 (history_first_question이 비어 있으면 메시지에서 첫 질문을 요약)
      const withSummary = await Promise.all(
        histArray.map(async h => {
          const sessionId = h.chat_bot_history_id.toString();
          let summaryText = (h.history_first_question || '').trim();

          if (!summaryText) {
            // 질문 필드가 비어 있으면, 실제 메시지를 가져와서 요약
            const raw = await fetchSessionMessages(sessionId);
            const dataArray = Array.isArray(raw)
              ? raw
              : Array.isArray(raw.content)
              ? raw.content
              : [];

            const msgs = dataArray.map(m => ({
              from: m.message_type === 'AI' ? 'bot' : 'user',
              text: m.message_content,
              timestamp: m.timestamp_create_at
            }));

            summaryText = await generateSummary(msgs);
          }

          // 그래도 빈 문자열이면 기본 제목
          if (!summaryText) {
            summaryText = '새로운 대화';
          }

          return {
            id:        sessionId,
            title:     summaryText,
            createdAt: h.history_created_at,
            messages:  []  // 클릭 시 handleSelectSession에서 채워집니다
          };
        })
      );

      setSessions(withSummary);

    } catch (err) {
      console.error('히스토리 목록 조회 실패', err);
    }
  }

  loadHistories();
}, [handleSelectSession]);

  // ── 메시지 보내기 ──
  const handleSend = async (text) => {
    if (!text.trim()) return;
    const now = new Date();
    let sessionId = currentId;
    let updatedSessions;

    if (sessionId) {
      updatedSessions = sessions.map(s =>
        s.id === sessionId ? { ...s, messages: [...s.messages, { from: 'user', text }] } : s
      );
    } else {
      sessionId = now.getTime().toString();
      updatedSessions = [
        { id: sessionId, title: '', createdAt: now.toISOString(), messages: [{ from: 'user', text }] },
        ...sessions
      ];
    }

    setSessions(updatedSessions);
    setCurrentId(sessionId);

    // 요약과 타이틀 업데이트
    const summary = await generateSummary(updatedSessions.find(s => s.id === sessionId).messages);
    setSessions(updatedSessions.map(s => s.id === sessionId ? { ...s, title: summary } : s));
    setCurrentId(sessionId);

    // 로딩 및 임시 텍스트 표시
    setIsLoading(true);
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: [...s.messages, { from: 'bot', text: '...' }] } : s
    ));

    try {
      const aiResponse = await fetchChatbotResponse(sessionId, text);
      console.log('AI 응답: ', aiResponse);
      
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const msgs = s.messages.slice();
          const idx = msgs.findIndex(m => m.from === 'bot' && m.text === '...');
          if (idx !== -1) msgs[idx] = { from: 'bot', text: aiResponse, showButton: true };
          return { ...s, messages: msgs };
        }
        return s;
      }));
    } catch (err) {
      console.error('AI 응답 중 오류 발생:', err);
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const msgs = s.messages.slice();
          const idx = msgs.findIndex(m => m.from === 'bot' && m.text === '...');
          if (idx !== -1) msgs[idx] = { from: 'bot', text: '오류가 발생했습니다.' };
          return { ...s, messages: msgs };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    setCurrentId(null);
  };

  const handleReset = () => {
    setSessions([]);
    setCurrentId(null);
  };

  const currentSession = sessions.find(s => s.id === currentId) || null;

  
  return (
    <div className="chat">
      <Header />
      <div className="chat-layout">
        <aside className="chat-sidebar open">
          <ChatSidebar
            sessions={sessions}
            currentId={currentId}
            onSelect={handleSelectSession}
            onNew={handleNew}
            onReset={handleReset}
          />
        </aside>
        <div className="chat-main">
          <ChatWindow session={currentSession}
            onNavigateToDoc={handleNavigateToDoc} />
          <div className="chat-input">
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
