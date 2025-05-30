import React, { useState, useEffect } from 'react';
import './SearchModal.css';

/**
 * props:
 *  - subjectId: 선택된 과목의 ID
 *  - onSelect(material) : 사용자가 교안을 클릭했을 때 호출
 */
export default function MaterialSearch({ subjectId, onSelect }) {
  const [query, setQuery] = useState('');
  const [materials, setMaterials] = useState([]);

  // subjectId가 바뀔 때마다 해당 과목 교안 목록 로드
  useEffect(() => {
    if(!subjectId){
      setMaterials([]);
      return;
    }

    async function fetchMaterials() {
      // TODO: 실제 API 호출
      const mock = {
        eng: [
          { id: 'eng1', title: '영어문법 기초' },
          { id: 'eng2', title: '영어회화 연습' },
        ],
        math: [
          { id: 'mat1', title: '미적분 요약' },
          { id: 'mat2', title: '기하 문제풀이' },
        ],
        cs: [
          { id: 'cs1', title: '자료구조' },
          { id: 'cs2', title: '알고리즘' },
        ],
      };
      setMaterials(mock[subjectId] || []);
    }
    fetchMaterials();
  }, [subjectId]);

  const filtered = materials.filter(m =>
    m.title.includes(query)
  );

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
