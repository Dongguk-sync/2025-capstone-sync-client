import "./Header.css"
import {FaBars} from 'react-icons/fa'

const Header = ({goTo})=> {
    return (
        <div className="Header">
            <button 
                className="Logo"
                onClick={()=>goTo('main')}
                >
                    Baekji</button>
            <div className="menu">
                <button
                    onClick={()=> goTo('chatbot')}>
                        챗봇에게 질문하기
                </button>
                <button>학습기록 및 교안관리</button>
                <button
                    className="profile-btn">
                        <img 
                            src="../avatar.jpg"
                        />
                </button>
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