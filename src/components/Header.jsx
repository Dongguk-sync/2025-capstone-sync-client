import "./Header.css"
import {FaBars} from 'react-icons/fa'
import profile from "../assets/avatar.jpg"
import { Link } from 'react-router-dom'; 
import { getCurrentUser } from '../api/axios';
import { useState, useEffect } from 'react';


const Header = ()=> {
    const [profileUrl, setProfileUrl] = useState(profile);

    useEffect(() => {
    // 2) 마운트 시 현재 사용자 정보 요청
        getCurrentUser()
        .then(res => {
            const url = res.content?.user_profile_url;
            if (url) setProfileUrl(url);
        })
        .catch(err => {
            console.error('프로필 이미지 로드 실패:', err);
        });
    }, []);


    return (
        <div className="Header">
            <Link to ='/main' className="Logo">
                Baekji
            </Link>
            <div className="menu">
                <Link to ='/ChatBot' className="chatbot">
                    챗봇에게 질문하기
                </Link>
                <button>학습기록 및 교안관리</button>
                <Link to ='/Profile' className="profile-btn">
                    <img 
                        src={profileUrl} alt="profile" className="profile-btn"
                    />
                </Link>
                <button
                // 반응형으로 화면 작을 때만 나타내기
                    className="hamburger-btn">
                    <FaBars size={16} />
                </button>
                
            </div>
            
        </div>
    )
}

export default Header;