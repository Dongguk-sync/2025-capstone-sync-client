/* FeedbackChatbox.jsx */
import React, { useEffect, useRef, useState } from 'react';
import './FeedbackChatBox.css';

export default function FeedbackChatBox({ scrollTarget }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    const initialFeedback = {
      from: 'system',
      text: `Linked List는 자료 삽입/삭제에 유리하고 배열보다 메모리 효율적입니다.
        단점은 탐색 속도이며, 종류로는 단일/이중/원형 리스트가 있습니다.`
    };
    setMessages([initialFeedback]);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    const response = await fetch('/chat/lecture_chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input }),
    });
    const data = await response.json();
    setMessages([...newMessages, { from: 'bot', text: data.answer }]);
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div
          key={idx}
          ref={idx === 0 ? scrollTarget : null} // 첫 메시지에만 ref 연결
          className={`message ${msg.from}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
          e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())
          }
          placeholder="질문을 입력하세요..."
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
}
