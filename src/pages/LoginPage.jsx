// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle }       from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver }        from 'react-icons/si';

import mailIcon   from '../assets/mail.png';
import PWIcon     from '../assets/password.png';
import EyeIcon    from '../assets/eye.png';
import EyeoffIcon from '../assets/eyeoff.png';

import './SlidePage.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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

          {/* Email */}
          <label className="auth-form__label email-input-wrapper">
            Email
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="auth-form__input"
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

          <button className="auth-form__submit">Login</button>

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
