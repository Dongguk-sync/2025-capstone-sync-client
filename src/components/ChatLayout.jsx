// src/components/ChatLayout.jsx
import React, { useState } from 'react';
// import { isToday } from 'date-fns';
import useLocalStorage from '../hooks/useLocalStorage';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { FaBars, FaChevronLeft } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import './ChatLayout.css';

// 첫 번째 사용자 발화 기준 단순 요약 함수
async function generateSummary(messages) {
  const firstUser = messages.find(m => m.from === 'user');
  if (!firstUser) return '새로운 대화';
  const text = firstUser.text;
  return text.length > 30 ? text.slice(0, 30) + '...' : text;
}

export default function ChatLayout() {
  const [sessions, setSessions] = useLocalStorage('sessions', []);
  const [currentId, setCurrentId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(open => !open);

    // 메시지 전송: 오늘 세션 사용 또는 새 세션 생성
  const handleSend = async (text) => {
    if (!text.trim()) return;
    const now = new Date();
    let sessionId;
    let updatedSessions;

    if (currentId) {
      // 기존 세션에 메시지 추가
      sessionId = currentId;
      updatedSessions = sessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, { from: 'user', text }] }
          : s
      );
    } else {
      // +새 대화 후 첫 메시지: 항상 새 세션 생성
      sessionId = now.getTime().toString();
      updatedSessions = [
        { id: sessionId, title: '', createdAt: now.toISOString(), messages: [{ from: 'user', text }] },
        ...sessions
      ];
    }

    setSessions(updatedSessions);
    setCurrentId(sessionId);

    // 세션 제목 요약 생성 및 업데이트
    const session = updatedSessions.find(s => s.id === sessionId);
    const summary = await generateSummary(session.messages);
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, title: summary } : s))
    );

    // TODO: 챗봇 API 호출 후 응답 추가 및 재요약
  };

  // + 새 대화: 초기 화면 전환 (이전 세션 유지)
  const handleNew = () => {
    setCurrentId(null);
  };

  // 세션 초기화: 모든 세션 삭제 -> 프론트엔드 개발용
  const handleReset = () => {
    setSessions([]);
    localStorage.removeItem('sessions');
    setCurrentId(null);
  };

  // 현재 선택된 세션
  const currentSession = sessions.find(s => s.id === currentId) || null;

  return (
    <div className="chat-layout">
      {/* 사이드바가 열려있는 경우만 나타남 */}
      <div className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
              <p>Sessions</p>
            </div>
            <ChatSidebar
              sessions={sessions}
              currentId={currentId}
              onSelect={setCurrentId}
              onNew={handleNew}
              onReset={handleReset}
            />
          </aside>
      </div>
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
          </button>

      {/* 토글 버튼: 항상 보이도록 aside 바깥에 배치 */}
      
      
      <div className="chat-main">
        <ChatWindow session={currentSession} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
