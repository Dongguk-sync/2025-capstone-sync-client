import React, { useRef, useState, useEffect } from 'react';

export default function RecordingModal1() {
    const [recording, setRecording] = useState(false);    // 녹음 중 여부
  const [transcript, setTranscript] = useState('');     // STT 결과 텍스트
  const [errorMsg, setErrorMsg] = useState('');         // 오류 메시지

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Vite 환경 변수로 CLOVA URL/KEY 가져오기(VITE_ 접두사 필요)
  const CLOVA_URL = import.meta.env.VITE_CLOVA_INVOKE_URL + "?lang=Kor";
  const CLOVA_KEY = import.meta.env.VITE_CLOVA_API_KEY;

  // 녹음 시작 함수
  const startRecording = async () => {
    setTranscript('');
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // MediaRecorder가 멈추면 하나의 Blob으로 합치고 STT 요청
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendToClova(audioBlob);

        // 리소스 정리
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('마이크 접근에 실패했습니다. 권한을 허용했는지 확인하세요.');
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Clova STT에 Blob을 전송하고 결과를 받아 transcript에 저장
  const sendToClova = async (audioBlob) => {
    if (!CLOVA_URL || !CLOVA_KEY) {
      setErrorMsg('Clova STT URL 또는 API 키가 설정되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch(CLOVA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-CLOVASpeech-API-Key': CLOVA_KEY,
        },
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error(`Clova STT 요청 실패: ${response.status}`);
      }

      const json = await response.json();
      // Clova STT 응답 구조에 맞춰서 텍스트를 뽑아냅니다.
      // 아래는 보통 {"text": "인식된_문장"} 형태로 리턴된다고 가정
      const textResult = json.text || '';
      setTranscript(textResult);
    } catch (err) {
      console.error(err);
      setErrorMsg('음성 인식 요청 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 언마운트 시, 남아 있는 MediaRecorder/트랙 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
    
    return (
        <div>
             <h2>클로바 STT 음성 녹음</h2>

      {/* 녹음 토글 버튼 */}
      <button
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? '녹음 중지' : '녹음 시작'}
      </button>

      {/* 녹음 상태 표시 */}
      {recording && <p>🎙️ 음성 인식 중…</p>}

      {/* STT 결과 출력 */}
      <div>
        <h3>인식 결과:</h3>
        <p>
          {transcript || (recording ? '말하세요…' : '녹음을 하고 결과를 확인하세요.')}
        </p>
      </div>

      {/* 오류 메시지 출력 */}
      {errorMsg && <p>{errorMsg}</p>}
        </div>
    )
}