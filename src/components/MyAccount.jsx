import profile from "../assets/avatar.jpg"
import React, { useState } from 'react';
import './MyAccount.css'
import OnOffToggle from "../components/OnOff";


export default function MyAccount() {
    const [ nickname, setNickname ] = useState('사용자 1');
    const [ email, setEmail ] = useState('user1@gmail.com');
    const [ isEditing, setIsEditing ] = useState(false);

    const handleButtonClick = () => {
        setIsEditing(prev => !prev)
    }

    return (
        <div className="MyAccount">
            <p>계정 관리</p>
            <div>
                <label>기본정보</label>
                <div className="basicInfo">
                    <img src={profile} className="Profile_icon"/>
                    <div className="Nickname">
                        <label>닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            readOnly={!isEditing}
                            onChange={e => setNickname(e.target.value)} />
                    </div>
                    <div className="Email">
                        <label>이메일</label>
                        <input
                            type="email"
                            value={email}
                            readOnly={!isEditing}
                            onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <button
                            onClick={handleButtonClick}
                            className="">
                                {isEditing ? '저장' : '수정'}
                            </button>
                    </div>
                </div>
            </div>
            <div>
                <label>비밀번호</label>
                <div className="password">
                    <div className="password_update">최근 업데이트: 2025년 3월 30일</div>
                    <button
                        className="password_btn">비밀번호 변경</button>
                </div>
            </div>
            
            <div>
                <label>학습 알림</label>
                <div className="E-Alarm">
                    <div>
                        <label>학습 알림</label>
                        <div className="studyalarm">
                            <div>학습 알림을 이메일로 받겠습니다.</div>
                            <OnOffToggle />
                        </div>
                    </div>
                    <div>
                        <label>시험 알림</label>
                        <div className="examalarm">
                            <div>시험 알림을 이메일로 받겠습니다.</div>
                            <OnOffToggle />
                        </div>
                    </div>
                </div>
                
            </div>

            <div>
                <label>계정 삭제</label>
                <div className="deleteAccount">
                    <div>계정 삭제시 모든 학습 기록이 삭제되며 복구할 수 없습니다.</div>
                    <button>계정 삭제</button>
                </div>
            </div>
        </div>
    )
}