import React from 'react';
import { isToday, isYesterday } from 'date-fns';

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

export default function ChatSidebar({ sessions, currentId, onSelect, onNew }) {
  const groups = groupByDate(sessions);

  return (
    <aside className="chat-sidebar">
      {/* 새 대화 */}
      <div className="sidebar-actions">
        <button className="new-session-button" onClick={onNew}>
          새로운 대화
        </button>
      </div>
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
