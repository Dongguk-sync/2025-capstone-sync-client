// src/services/ChatService.js
import axios from '../api/axios';


// 1) 사용자별 전체 히스토리 가져오기
export async function fetchUserHistories(userId) {
  const { data } = await axios.get(
    `/chatbot-histories/user-id/${userId}`
  );
  // data: [ { sender:'USER'|'BOT', message:'…', timestamp:'…' }, … ]
  return data.content;
}

export async function createChatHistory(userId) {
  const { data } = await axios.post('/chatbot-histories', { user_id: userId });
  if (!data.success) throw new Error(data.error?.message || '히스토리 생성 실패');
  return data.content.chat_bot_history_id;
}

// 2) 특정 히스토리(session) 의 메시지 전체 조회
export async function fetchSessionMessages(sessionId) {
  const { data } = await axios.get(
    `/chatbot-messages/chat_bot_history_id/${sessionId}`
  );
  return data.content;
}


// 3) 챗봇에 메시지 전송 → AI 응답 받기
// 미완성 (api 주소 변경해야함)
export async function fetchChatbotResponse(sessionId, message) {
  const payload = { 
    chat_bot_history_id: sessionId, 
    message_type: 'HUMAN',
    message_content: message };

  const { data } = await axios.post(
    '/chatbot-messages',
    payload
  );
  console.log('응답 전체: ', data);
  if(!data.success) {
    throw new Error(data.err || 'AI 응답을 가져오는데 실패했습니다.');
  }
  if(!data.content) {
    throw new Error('서버에서 응답 내용을 찾을 수 없습니다.');
  }
  // { response: "AI 답변 텍스트" } 형태로 온다고 가정
  return data.content.message_content;
}
