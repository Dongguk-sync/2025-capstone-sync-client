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
export async function fetchChatbotResponse(userId, historyId, text) {
  // const response = await axios.post('/chatbot-messages', {
  //   // chat_bot_history_id: historyId ? Number(historyId) : null,
  //   ...(historyId == null) 
  //     ? { chat_bot_history_id: null}
  //     : {chat_bot_history_id: Number(historyId)};
  //   user_id: userId,
  //   message_type: 'HUMAN',
  //   message_content: text
  // });
  // return response.data;
  const body = {
    user_id: userId,
    message_type: 'HUMAN',
    message_content: text
  };
  // historyId가 있을 때만 키를 추가
  if (historyId != null) {
    body.chat_bot_history_id = Number(historyId);
  }

  const { data } = await axios.post('/chatbot-messages', body);
  return data;
}
