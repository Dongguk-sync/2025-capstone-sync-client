import React, { useState, useEffect } from 'react';
import './SearchModal.css';
import instance from "../api/axios";

export default function MaterialSearch({ subjectName, subjectId, onSelect }) {
  const [query, setQuery] = useState('');
  const [materials, setMaterials] = useState([]);

    // subjectId가 바뀔 때마다 해당 과목 교안 목록 로드
  useEffect(() => {
    if (!subjectId) {
      setMaterials([]);
      return;
    }

    async function fetchMaterials() {
      try {
        // API 호출: /api/answer-files/subject-id/{subjectId}
        const res = await instance.get(`/answer-files/subject-id/${subjectId}`);
        const raw = res.data.content;
        const list = Array.isArray(raw) ? raw : [raw];

        const mapped = list.map(item => ({
          id:    item.file_id,
          title: item.file_name
        }));

        setMaterials(mapped);
      } catch (err) {
        console.error('교안 목록 로드 실패:', err);
        setMaterials([]);
      }
    }

    fetchMaterials();
  }, [subjectId]);

  const filtered = materials.filter(m =>
    m.title.includes(query)
  );


  if(subjectId && materials.length === 0) {
    return (
      <div>
        <p>{subjectName} 과목에 등록된 교안이 아직 없습니다.</p>
        <p>먼저 교안 관리 페이지에서 교안을 추가해주세요.</p>
      </div>
    )
  }

  if(!subjectId) {
    return (
      <div>
        <p>과목을 먼저 선택해주세요.</p>
      </div>
    )
  }

  return (
    <div className="search-modal">
      <input
        type="text"
        className="search-input"
        placeholder="교안명 검색"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <ul className="search-list">
        {filtered.map(m => (
          <li
            key={m.id}
            className="search-item"
            onClick={() => onSelect(m)}
          >
            {m.title}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="search-noresult">검색 결과 없음</li>
        )}
      </ul>
    </div>
  );
}
