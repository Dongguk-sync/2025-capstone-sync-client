// src/components/ChatInput.jsx
import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const send = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="chat-input-container">
      <TextareaAutosize
        className="chat-input"
        minRows={1}        /* 최소 1줄 */
        maxRows={6}        /* 최대 6줄 */
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e =>
          e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())
        }
        placeholder="메시지를 입력하세요..."
      />
      <button className="send-button" onClick={send}>
        ➤
      </button>
    </div>
  );
}
