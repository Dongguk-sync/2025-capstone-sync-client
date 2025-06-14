import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import {
  fetchUserHistories,
  fetchSessionMessages,
  fetchChatbotResponse
} from '../services/ChatService';
import './ChatLayout.css';
import Header from "../components/Header";
import { FaRegSquare } from 'react-icons/fa';
import { getCurrentUser } from '../api/axios';

// 첫 번째 사용자 발화 기준 단순 요약 함수
async function generateSummary(messages) {
  if(!Array.isArray(messages) || messages.length === 0){
    return '';
  }
  const firstUser = messages.find(
    m => m.from === 'user' && typeof m.text === 'string' && m.text.trim() !== '');
  
    if (!firstUser) return '';

  const text = firstUser.text.trim();
  return text.length > 30 ? text.slice(0, 30) + '...' : text;
}

export default function ChatLayout() {
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();


  // ── 관련 교안 페이지로 이동 ──
    const handleNavigateToDoc = (docId, historyIndex) => {
      navigate(`/feedback/${docId}/${historyIndex}`);
    };

  // ── 세션 선택 시: 메시지 로드 ──
  const handleSelectSession = useCallback(async (sessionId) => {
    try {
      const raw = await fetchSessionMessages(sessionId);
      // console.log('fetchSessionMessages raw: ', raw);

      const dataArray = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.content)
      ? raw.content
      : [];
      // const dataArray = Array.isArray(raw)
      //   ? raw
      //   :Array.isArray(raw.content)
      //     ? raw.content
      //     : [];
      // console.log('messages array: ', dataArray);

      const msgs = dataArray.map(m => ({
        from: m.message_type === 'AI' ? 'bot' : 'user',
        text: m.message_content,
        timestamp: m.timestamp_create_at,
        file_url: m.file_url,
        file_name: m.file_name,
        subject_name: m.subject_name,
      }));
      // console.log('mapped msg: ', msgs);

      const summary = await generateSummary(msgs);

      setSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, messages: msgs, title: summary } 
            // ? {...s, message: msgs}
            : s
          )
        );
      setCurrentId(sessionId);
    } catch (err) {
      console.error('세션 메시지 로드 실패', err);
    }
  }, []);

  useEffect(() => {
  async function loadHistories() {
    try {
      // 1) 실제 로그인된 유저 정보 가져오기
      const userRes = await getCurrentUser();
      setUserId(userRes.content.user_id);

      // 2) 해당 유저의 히스토리 불러오기
      const histories = await fetchUserHistories(userRes.content.user_id);
      const histArray = Array.isArray(histories) ? histories : histories.content;

      // 3) 세션 상태 셋업 (history_first_question이 비어 있으면 메시지에서 첫 질문을 요약)
      const withSummary = await Promise.all(
        histArray.map(async h => {
          const sessionId = h.chat_bot_history_id.toString();
          let summaryText = (h.history_first_question || '').trim();

          if (!summaryText) {
            // 질문 필드가 비어 있으면, 실제 메시지를 가져와서 요약
            const raw = await fetchSessionMessages(sessionId);
            const dataArray = Array.isArray(raw)
              ? raw
              : Array.isArray(raw.content)
              ? raw.content
              : [];

            const msgs = dataArray.map(m => ({
              from: m.message_type === 'AI' ? 'bot' : 'user',
              text: m.message_content,
              timestamp: m.timestamp_create_at
            }));

            summaryText = await generateSummary(msgs);
          }

          // 그래도 빈 문자열이면 기본 제목
          if (!summaryText) {
            summaryText = '새로운 대화';
          }

          return {
            id:        sessionId,
            title:     summaryText,
            createdAt: h.history_created_at,
            messages:  []  // 클릭 시 handleSelectSession에서 채워집니다
          };
        })
      );

      setSessions(withSummary);

    } catch (err) {
      console.error('히스토리 목록 조회 실패', err);
    }
  }

  loadHistories();
}, [handleSelectSession]);


  // ── 메시지 보내기 ──
  const handleSend = async (text) => {
    if (!text.trim()) return;
    setIsLoading(true);

    const now = new Date();
    const isNewSession = !currentId;
    let sessionId = currentId;
    let updatedSessions;

    updatedSessions = prev => {
      if(isNewSession) {
        sessionId = now.getTime().toString();
        return [
          {
            id: sessionId,
            title: '',
            createdAt: now.toISOString(),
            messages: [{ from: 'user', text }, { from: 'bot', text: '…', showButton: false }]
          },
          ...prev
        ];
      } else {
        return prev.map(s => 
          s.id === currentId
            ? {
              ...s,
              messages: [
                ...s.messages, 
                { from: 'user', text }, 
                { from: 'bot', text: '…', showButton: false }]
            }
          : s
        )
      }
    }

    const current = sessions.find(s => s.id === sessionId);

    if(current) {
      const summayText = await generateSummary(current.messages);
      setSessions(prev => 
        prev.map(s =>
          s.id === sessionId
            ? {...s, title: summayText}
            :s
        )
      )
    }
    setSessions(updatedSessions);
    setCurrentId(sessionId);

      try {
        const resp = await fetchChatbotResponse(
          userId, 
          sessionId,
          text
        );
        // resp.content 아래에 실제 데이터가 있습니다
        console.log('호출 직후 resp= ', resp);
        
        if(!resp.success || !resp.content) {
          console.error('API 응답 오류: ', resp.error);
          alert('메시지를 저장할 수 없습니다. 다시 시도해주세요.');
          return;
        }
        // if(!resp.success || !resp.content  || resp.content.message_content == null) {
        //   console.log('API 응답 오류: ', resp);
        //   resp.content = {
        //     ...resp.content,
        //     message_content: '[AI 응답이 없습니다 ]'
        //   }

        //   const botReply = resp.content.message_content;

        //   setSessions(prev => 
        //     prev.map(s => 
        //       s.id === sessionId
        //       ? {...s, messages: [...s.messages, {from: 'bot', text: botReply}]}
        //       : s
        //     )
        //   )
        //   setIsLoading(false);
        //   alert('AI응답을 받을 수 없습니다.');
        //   return;
        // }
        // const botText = resp.content?.message_content ?? '[AI 응답이 없습니다]';
        // setSessions(prev =>
        //   prev.map(s =>
        //     s.id === sessionId
        //     ? {...s, messages: [...s.messages, {from: 'bot', text: botText}]}
        //     : s
        //   )
        // )
        // const botText = resp.content.message_content;
        // setSessions(prev => 
        //   prev.map(s => 
        //     s.id === sessionId
        //       ? {
        //         ...s,
        //         messages: [...s.messages, {from: 'bot', text: botText}]
        //       }
        //       :s
        //   )
        // )

        // const newId = String(resp.content.chat_bot_history_id);
        
        // const historyId = resp.content.chat_bot_history_id;
        // const botReply  = resp.content.message_content;
        // const newSessionId = historyId.toString();

        // const summaryText = await generateSummary(
        //   sessions.find(s => s.id === sessionId).messages.map(m =>
        //     m.text === '...' ? {...m, text: botReply} : m
        //   )
        // );
        // setSessions(prev => 
        //   prev.map(s => {
        //     if(s.id !== sessionId) return s;
        //     const newMessages = s.messages.map(m =>
        //       m.text === '...'
        //       ? {from :'bot', text: botReply, showButton: true}
        //       : m
        //     );
        //     return {
        //       ...s,
        //       id: newId,
        //       messages: newMessages,
        //       title: summaryText
        //     }
        //   })
        // )
        // setCurrentId(newId);

        // setSessions(updatedSessions);
        // setCurrentId(sessionId);

        const { chat_bot_history_id, message_content, file_url } = resp.content;
        const newId = String(chat_bot_history_id);
        
        let updatedMessages = [];

        setSessions(prev =>
          prev.map(s => {
            if (s.id !== sessionId) return s;

            updatedMessages = s.messages.map(m =>
              m.from === 'bot' && m.text === '...'
              ? {
                  from: 'bot', 
                  text: message_content, 
                  showButton: !file_url,
                  file_url: file_url
                } 
              : m
            );

            return {
              ...s,
              id: newId,
              messages: updatedMessages
            };
      })
        )
        setCurrentId(newId);


        const newTitle = await generateSummary(updatedMessages);
        setSessions(prev =>
          prev.map(s =>
            s.id === newId
            ? {...s, title: newTitle}
            : s
          )
        )

        await handleSelectSession(newId);

      } catch(err) {
        console.log('AI 응답 중 오류 발생: ', err);
      } finally {
        setIsLoading(false);
      }
  };

  const handleNew = () => {
    setCurrentId(null);
  };

  const handleReset = () => {
    setSessions([]);
    setCurrentId(null);
  };

  const currentSession = sessions.find(s => s.id === currentId) || null;

  
  return (
    <div className="chat">
      <Header />
      <div className="chat-layout">
        <aside className="chat-sidebar open">
          <ChatSidebar
            sessions={sessions}
            currentId={currentId}
            onSelect={handleSelectSession}
            onNew={handleNew}
            onReset={handleReset}
          />
        </aside>
        <div className="chat-main">
          <ChatWindow session={currentSession}
            onNavigateToDoc={handleNavigateToDoc} />
          <div className="chat-input">
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
