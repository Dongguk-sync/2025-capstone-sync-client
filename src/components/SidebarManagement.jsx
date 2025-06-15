// src/components/SidebarManagement.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaRegFileAlt, FaFolder, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../pages/DocumentManagementPage.css';
import axios from '../api/axios';

export default function SidebarManagement({
  userId,
  activeFolder,
  onSelectFolder,
  onEditFolder,
}) {
  const [folders, setFolders]           = useState([]);
  const [isAdding, setIsAdding]         = useState(false);
  const [inputValue, setInputValue]     = useState('');
  const [editingId, setEditingId]       = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef(null);

  // 1) userId가 바뀔 때마다 과목 목록 API 호출
  useEffect(() => {
    if (!userId) return;

    axios.get(`/subjects/user-id/${userId}`)
      .then(res => {
        const apiFolders = res.data.content || [];
        setFolders(apiFolders.map(f => ({
          id:   f.subject_id,
          name: f.subject_name
        })));
      })
      .catch(err => {
        console.error('폴더 로딩 실패:', err);
      });
  }, [userId]);

  // 2) 입력창 포커스 관리
  useEffect(() => {
    if ((isAdding || editingId !== null) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding, editingId]);

  // 3) 새 과목 추가 완료
  const finishAdding = async () => {
    const name = inputValue.trim();
    if (!name) {
      setIsAdding(false);
      return;
    }
    try {
      const res = await axios.post('/subjects', {
        subject_name: name,
        user_id: userId
      });

      // 2) API가 반환한 새 과목 정보 꺼내기
      const newSubj = res.data.content; 
      //    예: { subject_id: 10, subject_name: "컴퓨터 구조", created_at: "...", user_id:1 }

      // 3) 로컬 folders 상태에 즉시 추가
      setFolders(prev => [
        ...prev,
        { id: newSubj.subject_id, name: newSubj.subject_name }
      ]);

      // 5) 자동으로 추가된 과목을 선택하고 싶다면
      onSelectFolder(newSubj.subject_id);
    } catch (err) {
      console.error('과목 추가 실패:', err);
      alert('과목 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
      setInputValue('');
    }
  };


  // 4) 과목 수정 시작
  const startEditing = folder => {
    setEditingId(folder.id);
    setEditingValue(folder.name);
  };

  // 5) 과목 수정 완료 (API 호출 + 로컬 상태 업데이트)
  const finishEditing = async () => {
    const newName = editingValue.trim();
    if (!newName) {
      setEditingId(null);
      setEditingValue('');
      return;
    }
    try {
      await axios.put(`/subjects/id/${editingId}`, {
        subject_name: newName
      });
      onEditFolder(editingId, newName);
      setFolders(prev =>
        prev.map(f =>
          f.id === editingId ? { ...f, name: newName } : f
          )
        );
    } catch (err) {
      console.error('과목 수정 실패:', err);
      alert('과목명 수정에 실패했습니다.');
    } finally {
      setEditingId(null);
      setEditingValue('');
    }
  };


  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">과목 별 교안 목록</h2>
      <ul className="folder-list">
        {/* 전체 보기 */}
        <li
          className={`folder-item all ${activeFolder === 'all' ? 'active' : ''}`}
          onClick={() => onSelectFolder('all')}
        >
          <FaRegFileAlt className="folder-icon" />
          <span>모든 교안</span>
        </li>

        {/* 과목 추가 */}
        <li className="folder-item add-folder" onClick={() => setIsAdding(true)}>
          {isAdding ? (
            <input
              ref={inputRef}
              className="add-input"
              type="text"
              placeholder="과목명을 입력하세요"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  finishAdding();
                }
                else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setInputValue('');
                  e.target.blur();
                }
              }}
            />
          ) : (
            <button className="add-btn">
              <FaPlus className="folder-icon" />
              <span>과목 추가</span>
            </button>
          )}
        </li>

        {/* 과목 리스트 */}
        {folders.map(folder => (
          <li
            key={folder.id}
            className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            {editingId === folder.id ? (
              <input
                ref={inputRef}
                className="edit-input"
                type="text"
                value={editingValue}
                onChange={e => setEditingValue(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    finishEditing();
                    e.target.blur();
                  } else if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditingValue('');
                    e.target.blur();
                  }
                }}
              />
            ) : (
              <>
                <div className="folder-label">
                  <FaFolder className="folder-icon" />
                  <span>{folder.name}</span>
                </div>
                <div className="folder-actions">
                  <button
                    className="action-btn"
                    onClick={e => {
                      e.stopPropagation();
                      startEditing(folder);
                    }}
                    title="과목 수정"
                  >
                    <FaEdit />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
