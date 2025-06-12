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

// 첫 번째 사용자 발화 기준 단순 요약 함수
async function generateSummary(messages) {
  const firstUser = messages.find(m => m.from === 'user');
  if (!firstUser) return '새로운 대화';
  const text = firstUser.text;
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
      const msgs = Array.isArray(raw)
        ? raw.map(m => ({
            from: m.sender === 'BOT' ? 'bot' : 'user',
            text: m.message,
            timestamp: m.timestamp
          }))
        : [];
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: msgs } : s));
      setCurrentId(sessionId);
    } catch (err) {
      console.error('세션 메시지 로드 실패', err);
    }
  }, []);

  // ── 마운트 시: 사용자 히스토리 목록 조회 ──
  useEffect(() => {
    const userId = 1; // TODO: 로그인 유저 ID로 동적 설정
    fetchUserHistories(userId)
      .then(response => {
        // 응답이 배열이 아닐 경우, 배열 속성을 확인
        const histArray = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];
        const mapped = histArray.map(h => ({
          id: h.id.toString(),
          title: h.title || new Date(h.createdAt).toLocaleString(),
          createdAt: h.createdAt,
          messages: []
        }));
        setSessions(mapped);
        if (mapped.length) {
          handleSelectSession(mapped[mapped.length - 1].id);
        }
      })
      .catch(err => console.error('히스토리 목록 조회 실패', err));
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
  );
}
