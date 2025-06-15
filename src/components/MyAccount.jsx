import profile from "../assets/avatar.jpg"
import React, { useState, useEffect } from 'react';
import '../pages/Profile.css'
import OnOffToggle from "../components/OnOff";
import instance, {getCurrentUser} from "../api/axios";



export default function MyAccount() {
    const [userData, setUserData] = useState(null);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [profileUrl, setProfileUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    

    // Password change state
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    // const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);
    // 1) 마운트 시 사용자 정보 로드
    useEffect(() => {
        setLoading(true);
        getCurrentUser()
        .then(data => {
            // console.log('getCurrentUser', data);
            const content = data.content || data;
            setUserData(content);
            setNickname(content.user_name || '');
            setEmail(content.user_email || '');
            setProfileUrl(content.user_profile_url || '');
        })
        .catch(err => {
            console.error('내 정보 조회 실패:', err);
            setError('내 정보를 불러오지 못했습니다.');
        })
        .finally(() => setLoading(false));
    }, []);

    //  현재 프로필 수정하는 API 구현 X
    // const handleButtonClick = async () => {
    //     if (isEditing) {
    //     // 저장 모드
    //     setLoading(true);
    //     try {
    //         await instance.put(`/users/id/${userData.user_id}`, {
    //         user_nickname: nickname,
    //         user_email: email,
    //         });
    //         setError(null);
    //         // 변경된 정보 반영
    //         setUserData(prev => ({ ...prev, user_nickname: nickname, user_email: email }));
    //     } catch (e) {
    //         console.error('계정 업데이트 실패:', e);
    //         setError('업데이트 중 오류가 발생했습니다.');
    //     } finally {
    //         setLoading(false);
    //         setIsEditing(false);
    //     }
    //     } else {
    //     setIsEditing(true);
    //     }
    // };

    // const handleDeleteAccount = async () => {
    //     if (!window.confirm('정말 계정을 삭제하시겠습니까?')) return;
    //     try {
    //     await instance.delete(`/users/id/${userData.user_id}`);
    //     } catch (e) {
    //     console.error('계정 삭제 실패:', e);
    //     alert('계정 삭제 중 오류가 발생했습니다.');
    //     }
    // };

      // Change password
    const handlePasswordChange = async () => {
        if (!newPassword) {
            setPasswordError('모든 필드를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordLoading(true);
        try {
            await instance.patch(
                `/users/${userData.user_id}/password`, 
                { new_password: newPassword }
            );
            setPasswordError(null);
            setIsPasswordEditing(false);
            alert('비밀번호가 성공적으로 변경되었습니다.');
        } catch (e) {
            console.error('비밀번호 변경 실패:', e);
            setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setPasswordLoading(false);
            // setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleLogout = () => {
        if (!window.confirm('로그아웃 하시겠습니까?')) return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        delete instance.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    };

    return (
        <div className="MyAccount">
            <p>계정 관리</p>
            <div>
                <label>기본정보</label>
                <div className="basicInfo">
                    <img 
                        src={profileUrl || profile}
                        className="Profile_icon"/>
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
                            // 아직 프로필 생성 구현 X
                            // onClick={handleButtonClick}
                            className="edit-button">
                                {/* {isEditing ? (loading ? '저장중...' : '저장') : '수정(아직 구현X)'} */}
                                {isEditing ? (loading ? '저장중...' : '저장') : '수정'}
                            </button>
                    </div>
                </div>
                {error && userData && <div className="error-message">{error}</div>}
            </div>
            <div>
                <label>비밀번호</label>
                {isPasswordEditing ? (
                    <div className="passwordChange">
                        <input
                            type="password"
                            placeholder="새 비밀번호"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        <div className="button-group">
                            <button 
                                onClick={handlePasswordChange} 
                                disabled={passwordLoading} >
                            비밀번호 저장
                            </button>

                            <button 
                                className="password-cancel-btn"
                                onClick={() => setIsPasswordEditing(false)} 
                                disabled={passwordLoading} >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                            <div className="password">
                                <div>정기적인 비밀번호 변경은 계정 보안을 강화하는 데 도움이 됩니다.</div>
                                <button className="password_btn" onClick={() => setIsPasswordEditing(true)}>
                                    비밀번호 변경
                                </button>
                            </div>
                        )}
            </div>
            
            {/* <div>
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
                
            </div> */}

            <div>
                {/* <label>계정 삭제</label>
                <div className="deleteAccount">
                    <div>계정 삭제시 모든 학습 기록이 삭제되며 복구할 수 없습니다.</div>
                    <button onClick={handleDeleteAccount}>계정 삭제</button>
                </div> */}
                <label>로그아웃</label>
                <div className="deleteAccount">
                    <div>로그아웃하면 현재 세션이 종료되고, 다시 로그인해야 서비스를 이용하실 수 있습니다.</div>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            </div>
        </div>
    )
}