// src/components/SidebarManagement.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaRegFileAlt, FaFolder, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../pages/DocumentManagementPage.css';

export default function Sidebar({
  // folders,
  activeFolder,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  // onDeleteFolder
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if ((isAdding || editingId) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding, editingId]);

  const finishAdding = () => {
    const name = inputValue.trim();
    if (name) onAddFolder({ id: Date.now().toString(), name });
    setInputValue('');
    setIsAdding(false);
  };

  const startEditing = folder => {
    setEditingId(folder.id);
    setEditingValue(folder.name);
  };

  const finishEditing = () => {
    const newName = editingValue.trim();
    if (newName) onEditFolder(editingId, newName);
    setEditingId(null);
    setEditingValue('');
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
              onBlur={finishAdding}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  finishAdding();
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setInputValue('');
                  e.currentTarget.blur();
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

        {/* 과목 리스트: 클릭(onSelectFolder)과 수정·삭제 분리 */}
        {
        // folders.map(folder => (
        //   <li
        //     key={folder.id}
        //     className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
        //     onClick={() => onSelectFolder(folder.id)}
        //   >
        //     {editingId === folder.id ? (
        //       // 수정 중일 때
        //       <input
        //         ref={inputRef}
        //         className="edit-input"
        //         type="text"
        //         value={editingValue}
        //         onChange={e => setEditingValue(e.target.value)}
        //         onBlur={finishEditing}
        //         onKeyDown={e => {
        //           if (e.key === 'Enter') {
        //             finishEditing();
        //             e.currentTarget.blur();
        //           } else if (e.key === 'Escape') {
        //             setEditingId(null);
        //             setEditingValue('');
        //             e.currentTarget.blur();
        //           }
        //         }}
        //       />
        //     ) : (
        //       <>
        //         {/* 폴더명 클릭만 onSelectFolder */}
        //         <div className="folder-label">
        //           <FaFolder className="folder-icon" />
        //           <span>{folder.name}</span>
        //         </div>

        //         {/* 수정·삭제 버튼 */}
        //         <div className="folder-actions">
        //           <button
        //             className="action-btn"
        //             onClick={e => {
        //               e.stopPropagation();
        //               startEditing(folder);
        //             }}
        //             title="과목 수정"
        //           >
        //             <FaEdit />
        //           </button>
        //           <button
        //             className="action-btn"
        //             onClick={e => {
        //               e.stopPropagation();
        //               onDeleteFolder(folder.id);
        //             }}
        //             title="과목 삭제"
        //           >
        //             <FaTrash />
        //           </button>
        //         </div>
        //       </>
        //     )}
        //   </li>
        // ))
        }
      </ul>
    </aside>
  );
}
