// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle }       from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver }        from 'react-icons/si';
import api from "../api/axios";

import mailIcon   from '../assets/mail.png';
import PWIcon     from '../assets/password.png';
import EyeIcon    from '../assets/eye.png';
import EyeoffIcon from '../assets/eyeoff.png';

import './SlidePage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');               // 이메일 입력 상태
  const [password, setPassword] = useState('');         // 비밀번호 입력 상태
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');         // 로그인 에러 메시지

  const navigate = useNavigate(); // React Router v6에서 화면 이동용


/* 소셜 로그인 */
const GoogleLogin = () => {
    // 우리 백엔드 구글 시작 url
    window.location.href = 'https://우리백엔드.com/auth/google'
  }
  const NaverLogin = () => {
    // 우리 백엔드 네이버버 시작 url
    window.location.href = 'https://우리백엔드.com/auth/naver'
  }
  const KakaoLogin = () => {
    // 우리 백엔드 카카오 시작 url
    window.location.href = 'https://우리백엔드.com/auth/kakao'
  }

    /* 일반 로그인 버튼 클릭 시 호출되는 함수 */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // 1) 백엔드 로그인 API 호출 (URL을 실제 엔드포인트로 교체)
      const res = await api.post(
        'http://localhost:8080/api/login',
        {
          // 백엔드가 기대하는 필드 구조일 것
          user_email: email.trim(),
          user_password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`
          }
          // withCredentials: true, 
          // 필요한 경우 (세션/쿠키 사용 시)
        }
      );

      // 2) 로그인 성공 시 응답 예시: { token: "eyJhbGc...", user: { ... } }
      const token = res.data.content?.access_token;
      if (token) {
        // 3) 받은 토큰을 localStorage(또는 쿠키)에 저장
        localStorage.setItem('accessToken', token);

        // 4) 로그인 성공 후 메인 페이지로 이동
        navigate('/main');
      } else {
        console.log('백엔드 오류 메시지: ', res.data.error.message);
        setErrorMsg('로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      // 백엔드에서 보낸 메시지가 err.response.data.message에 담겨있을 수 있음
      const msg = err.response?.data?.error?.message || err.response?.data?.message || '아이디/비밀번호를 확인해주세요.';
      setErrorMsg(msg);
      console.log('전체 에러 응답: ', err.response);
    }
  };

  return (
    <div className="slide-container slid">
      <div className="slide-panel slide-panel--left">
        <h1 className="landing__title">BaekJi</h1>
        <p className="landing__text">
          백지는 ‘백지 복습법’에서 시작된 자기주도 학습 서비스입니다. <br/>
          AI가 자동으로 채점해주고, 복습을 마친 후에는 궁금한 점을 챗봇에게 바로 물어볼 수 있어요. <br/>
          스스로 공부하고, 스스로 성장하는 학습 경험을 백지에서 만나보세요.
        </p>
      </div>

      {/* 오른쪽 패널 (로그인 폼) */}
      <div className="slide-panel slide-panel--right">
        <div className="auth-form">
          <div className="auth-form__header">
            계정이 없으신가요? <Link to="/signup">Signup</Link>
          </div>

          <h2 className="auth-form__title"><Link to="/main">로그인</Link></h2>
          <p className="auth-form__subtitle">이메일과 비밀번호를 입력하세요</p>
          
          {/* 에러 메세지 */}
          {errorMsg && <p>{errorMsg}</p>}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <label className="auth-form__label email-input-wrapper">
              Email
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="auth-form__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <img src={mailIcon} alt="mail" className="email-input-icon" />
            </label>

            {/* Password */}
            <label className="auth-form__label password-input-wrapper">
              Password
              <div className="auth-form__password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className="auth-form__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <img src={PWIcon} alt="lock" className="password-input-icon" />
                <button
                  type="button"
                  className="auth-form__toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  <img
                    src={showPassword ? EyeoffIcon : EyeIcon}
                    alt={showPassword ? '숨기기' : '보이기'}
                    className="password-toggle-icon"
                  />
                </button>
              </div>
            </label>

            <div className="auth-form__options">
              <label>
                <input type="checkbox" />
                <span>내 정보 기억하기</span>
              </label>
              <a href="/forgot">비밀번호 찾기</a>
            </div>

            <button 
              className="auth-form__submit"
              type="submit"
            >Login</button>

          </form>

          <div className="auth-form__divider">
            <span>or continue with</span>
          </div>

          <div className="auth-form__socials">
            <button
              type="button"
              onClick={GoogleLogin} // 클릭 시 네이버 로그인 팝업
              className="social-btn social-btn--google"
              aria-label="Google login"
            >
              <FaGoogle size={27} />
            </button>
            <button
              type="button"
              onClick={NaverLogin} // 클릭 시 구글 로그인 팝업
              className="social-btn social-btn--naver"
              aria-label="Naver login"
            >
              <SiNaver size={24} />
            </button>
            <button
              type="button"
              onClick={KakaoLogin} // 클릭 시 카카오 로그인 팝업
              className="social-btn social-btn--kakao"
              aria-label="Kakao login"
            >
              <RiKakaoTalkFill size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
