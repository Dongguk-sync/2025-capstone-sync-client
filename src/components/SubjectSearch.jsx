import React, { useState, useEffect } from 'react';
import './SearchModal.css';  // 공통 스타일

/**
 * props:
 *  - onSelect(subject) : 사용자가 과목을 하나 클릭했을 때 호출
 */
export default function SubjectSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);

  // 예시: 서버에서 과목 리스트를 가져온다고 가정
  useEffect(() => {
    async function fetchSubjects() {
      // TODO: 실제 API 호출로 대체
      const all = [
        { id: 'eng', name: '영어' },
        { id: 'math', name: '수학' },
        { id: 'cs',   name: '컴퓨터 과학' },
        { id: '1', name: 'one' },
        { id: '2', name: 'two' },
        { id: '3', name: 'three' },
        { id: '4', name: 'four' },
        { id: '5', name: 'five' },

        // …
      ];
      setSubjects(all);
    }
    fetchSubjects();
  }, []);

  // 검색어에 맞춰 필터링
  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="search-modal">
      <div>검색창에 과목명을 검색하세요</div>
      <input
        type="text"
        className="search-input"
        placeholder="과목명 검색"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <ul className="search-list">
        {filtered.map(s => (
          <li
            key={s.id}
            className="search-item"
            onClick={() => onSelect(s)}
          >
            {s.name}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="search-noresult">검색 결과 없음</li>
        )}
      </ul>
    </div>
  );
}
