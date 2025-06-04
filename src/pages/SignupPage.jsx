import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle }       from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver }        from 'react-icons/si';
import './SlidePage.css';
import axios from 'axios';
import mailIcon      from '../assets/mail.png';
import PWIcon        from '../assets/password.png';
import EyeIcon       from '../assets/eye.png';
import EyeoffIcon    from '../assets/eyeoff.png';
import PhoneIcon     from '../assets/phone.png';
import NameIcon      from '../assets/name.png';

export default function SignupPage() {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [password, setPassword]           = useState('');
  const [retypePassword, setRetype]       = useState('');
  const [errorMsg, setErrorMsg]           = useState('');
  const [nickname, setNickname]           = useState("nick");     // 추가
  const [role, setRole]                   = useState("USER");

  const navigate = useNavigate();

  // Password, Retype Password 각각 토글 상태
  const [showPassword, setShowPassword]   = useState(false);
  const [showRetype, setShowRetype]       = useState(false);
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

  const handleSubmit = async(e) => {
    e.preventDefault();
    setErrorMsg('');

    if(!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg("모든 필드를 입력해주세요");
      return;
    }

    if(password !== retypePassword){
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/signup',{
        user_email: email.trim(),
        user_password: password.trim(),
        user_name: name.trim(),
        user_phone_number: phone.trim(),
        user_nickname: nickname.trim(),
        user_role: role,
        },
        {
          headers: {
            'Content-Type' : 'application/json',
          },
          withCredentials: true,
        }
      );

      if(response.status === 201 || response.data.success) {
        console.log("회원가입 응답:", response);

        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        console.log('성공');
      } else {
        console.log("전체 응답 상태 코드:", response.status);
        console.log("응답 본문:", response.data);
        setErrorMsg(response.data?.error?.message || '회원가입에 실패했습니다.');

        setErrorMsg(response.data.message || '회원가입에 실패했습니다.');
      }
    }
    catch (err) {
      console.error('회원가입 API 오류', err);
      const msg = err.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.';
      setErrorMsg(msg);
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

      <div className="slide-panel slide-panel--right">
        <div className="auth-form">
          <div className="auth-form__header">
            계정이 있으신가요? <Link to="/login">Login</Link>
          </div>

          <h2 className="auth-form__title">회원가입</h2>
          <p className="auth-form__subtitle">
            계정을 생성하고 학습을 시작하세요!
          </p>


          {/* 여기부터 form */}
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <label className="auth-form__label email-input-wrapper">
              Name
              <input
                type="text"
                placeholder="이름을 입력하세요"
                className="auth-form__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <img src={NameIcon} alt="name" className="name-input-icon" />
            </label>

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

            {/* Phone */}
            <label className="auth-form__label phone-input-wrapper">
              Phone number
              <input
                type="tel"
                placeholder="전화번호를 입력하세요"
                className="auth-form__input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <img src={PhoneIcon} alt="phone" className="phone-input-icon" />
            </label>

            {/* Password */}
            <label className="auth-form__label password-input-wrapper">
              Password
              <div className="auth-form__password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 설정하세요"
                  className="auth-form__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <img src={PWIcon} alt="password" className="password-input-icon" />
                <button
                  type="button"
                  className="auth-form__toggle"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  <img
                    src={showPassword ? EyeoffIcon : EyeIcon}
                    alt={showPassword ? '숨기기' : '보이기'}
                    className="password-toggle-icon"
                  />
                </button>
              </div>
            </label>

            {/* Retype Password */}
            <label className="auth-form__label password-input-wrapper">
              Retype Password
              <div className="auth-form__password-wrapper">
                <input
                  type={showRetype ? 'text' : 'password'}
                  placeholder="한 번 더 입력하세요"
                  className="auth-form__input"
                  value={retypePassword}
                  onChange={(e) => setRetype(e.target.value)}
                  required
                />
                <img src={PWIcon} alt="password" className="password-input-icon" />
                <button
                  type="button"
                  className="auth-form__toggle"
                  onClick={() => setShowRetype(prev => !prev)}
                  aria-label={showRetype ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  <img
                    src={showRetype ? EyeoffIcon : EyeIcon}
                    alt={showRetype ? '숨기기' : '보이기'}
                    className="password-toggle-icon"
                  />
                </button>
              </div>
            </label>

            <button 
              className="auth-form__submit"
              type="submit"
            >Register</button>
          
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
