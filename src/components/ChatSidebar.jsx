import React from 'react';
import { isToday, isYesterday } from 'date-fns';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

function groupByDate(sessions) {
  const groups = { 오늘: [], 어제: [], 이전: [] };
  sessions.forEach(s => {
    const d = new Date(s.createdAt);
    if (isToday(d)) groups['오늘'].push(s);
    else if (isYesterday(d)) groups['어제'].push(s);
    else groups['이전'].push(s);
  });
  return groups;
}

export default function ChatSidebar({ sessions, currentId, onSelect, onNew, onReset, currentSession, onTitleChange }) {
  const groups = groupByDate(sessions);
  const isInitial = currentId === null;

  return (
    <aside className="chat-sidebar">
      {/* 새 대화 및 초기화 */}
      <div className="sidebar-actions">
        <button className="new-session-button" onClick={onNew}>
          새로운 대화
        </button>
        <button className="reset-button" onClick={onReset}>
          세션 초기화
        </button>
      </div>
      {/* 세션 제목 수정 (세션 선택시) */}
      {!isInitial && currentSession && (
        <input
          className="chat-sidebar-input"
          value={currentSession.title}
          onChange={e => onTitleChange(e.target.value)}
        />
      )}
      {/* 세션 목록: 항상 표시 */}
      <div className="chat-sidebar-sessions">
        {sessions.length === 0 && <div className="empty-message">세션이 없습니다.</div>}
        {Object.entries(groups).map(([label, list]) =>
          list.length > 0 && (
            <div key={label}>
              <div className="session-group-label">{label}</div>
              {list.map(s => (
                <div
                  key={s.id}
                  className={`session-item ${s.id === currentId ? 'active' : ''}`}
                  onClick={() => onSelect(s.id)}
                >
                  {s.title}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </aside>
)}
