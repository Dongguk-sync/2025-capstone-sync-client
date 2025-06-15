import React, { useEffect, useRef, useState } from 'react';
import axios from '../api/axios';
import './FeedbackChatBox.css';
import ReactMarkdown from 'react-markdown';
import '../styles/obsidian-things.css';

export default function FeedbackChatBox({
  fileId,
  history,
  chatTopRef,
  studysId
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);

  // 메시지 불러오기 함수 (재사용 목적)
  const loadMessages = async (baseMessages = []) => {
    try {
      const res = await axios.get(`/study-messages/studys-id/${studysId}`);
      const chatMessages = (res.data.content || []).map(msg => ({
        from: msg.message_type === 'AI' ? 'bot' : 'user',
        text: msg.sm_content
      }));
      setMessages([...baseMessages, ...chatMessages]);
    } catch (err) {
      console.error('❌ 채팅 메시지 로딩 실패:', err);
      setMessages(baseMessages); // 실패 시 피드백만 표시
    }
  };

  useEffect(() => {
    if (!fileId || !history) {
      setMessages([]);
      return;
    }

    // 학습 피드백 + 채팅 내역 불러오기
    axios.get(`/studys/file-id/${fileId}`)
      .then(async res => {
        const arr = res.data.content || [];
        const thisRound = arr.find(item => item.studys_round === history);
        if (!thisRound) {
          setMessages([]);
          return;
        }

        const baseMessages = [
          { from: 'system', text: thisRound.studys_feed_content }
        ];

        if (studysId) {
          await loadMessages(baseMessages);
        } else {
          setMessages(baseMessages);
        }
      })
      .catch(err => {
        console.error('❌ 학습 피드백 로딩 실패:', err);
        setMessages([]);
      });
  }, [fileId, history, studysId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    // 사용자 질문 + 로딩 메시지 먼저 표시
    setMessages(prev => [
      ...prev,
      { from: 'user', text: question },
      { from: 'bot', text: '답변을 작성 중입니다...' }
    ]);
    setInput('');

    try {
      // 서버에 질문 저장
      await axios.post('/study-messages/lecture/chat', {
        studys_id: studysId,
        question,
      });

      // 최신 채팅 내역 다시 불러오기
      const baseMessages = messages.filter(
        m => !(m.from === 'bot' && m.text === '답변을 작성 중입니다...')
      );
      await loadMessages(baseMessages);

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const loadingIndex = updated.findLastIndex(
          m => m.from === 'bot' && m.text === '답변을 작성 중입니다...'
        );
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            from: 'bot',
            text: '답변 중 오류가 발생했습니다.'
          };
        }
        return updated;
      });

      console.error('❌ 답변 요청 중 에러 발생:', err);
      console.error('Message:', err.message);
      console.error('Status:', err.response?.status);
      console.error('Response:', err.response?.data);
    } finally {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        <div ref={chatTopRef}></div>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            ref={idx === messages.length - 1 ? messageEndRef : null}
            className={`message ${msg.from}`}
          >
            <div className="markdown-preview-view">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
            e.key === 'Enter' && !e.shiftKey
              ? (e.preventDefault(), handleSend())
              : undefined
          }
          placeholder="질문을 입력하세요..."
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
}
