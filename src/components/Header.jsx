import "./Header.css"

const Header = ()=> {
    return (
        <div className="Header">
            <button className="Logo">Baekji</button>
            <div className="menu">
                <button>챗봇에게 질문하기</button>
                <button>학습기록 및 교안관리</button>
            </div>
            
        </div>
    )
}

export default Header;