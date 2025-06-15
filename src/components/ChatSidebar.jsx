import React from 'react';
// import { isToday, isYesterday } from 'date-fns';

import { parseISO, differenceInCalendarDays } from 'date-fns';

// function groupByDate(sessions) {
//   const groups = { 오늘: [], 어제: [], 이전: [] };
//   sessions.forEach(s => {
//     const d = new Date(s.history_created_at);
//     if (isToday(d)) groups['오늘'].push(s);
//     else if (isYesterday(d)) groups['어제'].push(s);
//     else groups['이전'].push(s);
//   });
//   return groups;
// }

function groupByDate(sessions) {
  const groups = {};  
  const today = new Date();

  sessions.forEach(s => {
    const date = parseISO(s.createdAt);
    const diff = differenceInCalendarDays(today, date);
    // 0 → 오늘, 1 → 1일 전, 2 → 2일 전, …
    const label = diff === 0 ? '오늘' : `${diff}일 전`;
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });

  return groups;
}


export default function ChatSidebar({ sessions, currentId, onSelect, onNew }) {
  const groups = groupByDate(sessions);


  const sortedLabels = Object.keys(groups)
    .sort((a, b) => {
      // “오늘”을 0, “1일 전” → 1, “2일 전”→2 로 파싱해서 정렬
      const dayNum = str => (str === '오늘' ? 0 : parseInt(str.replace('일 전',''),10));
      return dayNum(a) - dayNum(b);
    });


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
        {/* 히스토리 없을 경우 */}
        {sessions.length === 0 && <div className="empty-message">세션이 없습니다.</div>}
        
        {/* 히스토리 있는 경우 */}
        {sortedLabels.map(label => (
          <div key={label}>
            <div className="session-group-label">{label}</div>
            {groups[label].map(s => (
              <div
                key={s.id}
                className={`session-item ${s.id === currentId ? 'active' : ''}`}
                onClick={() => onSelect(s.id)}
              >
                {s.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
)}
