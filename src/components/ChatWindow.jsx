import React, { useEffect, useRef } from 'react';

export default function ChatWindow({ session }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  if (!session) {
    return (
      <div className="chat-empty">
        <h2 className="chat-header">궁금한 것을 물어보세요. </h2>
        <div className="suggestions">
          <div className="suggestion-card">
            <p>궁금한 것을 물어보세요. <br/> 교안을 참고해서 대답해드려요.</p>
            <blockquote>“로그인시 와 비로그인 시 리눅스의 환경 설정 파일의 작동 방식이 다른 이유가 뭐야?”</blockquote>
          </div>
          <div className="suggestion-card">
            <p>교안에서 보고싶은 내용으로 <br/> 바로 가기 해보세요.</p>
            <blockquote>”운영체제에서 fork를 통해 자식 프로세스가 생성되는 내용이 어느 교안 몇 페이지에서 나왔지?”</blockquote>
          </div>
          <div className="suggestion-card">
            <p>더 공부해야 할 부분을 <br/> 한눈에 확인해보세요.</p>
            <blockquote>“자료구조 챕터3에서, 내가 부족한 부분 요약해서 보여줘.” </blockquote>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {session.messages.map((m, i) => (
        <div key={i} className={`chat-message ${m.from}`}>
          {m.text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
