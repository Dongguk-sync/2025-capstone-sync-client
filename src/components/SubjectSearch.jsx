import React, { useState, useEffect } from 'react';
import './SearchModal.css';  // 공통 스타일
import instance, {getCurrentUser} from "../api/axios";

export default function SubjectSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);

    useEffect(() => {
    async function fetchSubjects() {
      try {
        // 1) 현재 로그인된 사용자 ID 얻기
        const user = await getCurrentUser();
        const userId = user.content.user_id;

        // 2) API 호출: /api/subjects/user-id/{userId}
        const res = await instance.get(`/subjects/user-id/${userId}`);
        const raw = res.data.content;
        const list = Array.isArray(raw) ? raw : [raw];

        // 3) subject_id/subject_name 필드 → id/name 형태로 매핑
        const mapped = list.map(item => ({
          id:   item.subject_id,       // 숫자 ID
          name: item.subject_name      // 과목명
        }));
        setSubjects(mapped);
      } catch (err) {
        console.error('과목 목록 로드 실패:', err);
        setSubjects([]);
      }
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
