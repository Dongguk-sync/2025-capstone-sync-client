import "./Header.css"
import {FaBars} from 'react-icons/fa'
import profile from "../assets/avatar.jpg"
import { Link } from 'react-router-dom'; 


const Header = ()=> {
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
                        src={profile} alt="profile" className="profile-btn"
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