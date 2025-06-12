// src/services/ChatService.js
import axios from '../api/axios';


// 1) 사용자별 전체 히스토리 가져오기
export async function fetchUserHistories(userId) {
  const { data } = await axios.get(
    `/api/chatbot-histories/user-id/${userId}`
  );
  // data: [ { sender:'USER'|'BOT', message:'…', timestamp:'…' }, … ]
  return data;
}


// 2) 특정 히스토리(session) 의 메시지 전체 조회
export async function fetchSessionMessages(sessionId) {
  const { data } = await axios.get(
    `/api/chatbot-messages/chat_bot_history_id/${sessionId}`
  );
  return data;
}


// 3) 챗봇에 메시지 전송 → AI 응답 받기
// 미완성 (api 주소 변경해야함)
export async function fetchChatbotResponse(sessionId, message) {
  const payload = { sessionId, message };
  const { data } = await axios.post(
    '/api/chatbot-messages',
    payload
  );
  // { response: "AI 답변 텍스트" } 형태로 온다고 가정
  return data.response;
}
