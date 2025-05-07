import "./Notice.css"

const Notice = () =>{

    return (
        <div className="todayNotice">
            <div>Today{new Date().toLocaleDateString()}</div>
            <div className="noticeBox">
                <div className="noticeFir">시험까지</div>
                <div className="noticeSec">오늘의 학습률</div>
                <div className="noticeThi">
                    <div className="hello">
                    sync님, 환영해요😄<br/>오늘 하루도 힘내서 공부해봅시다.
                    </div>
                    <div className="contiDate">
                        백지 학습 23일 째
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notice;