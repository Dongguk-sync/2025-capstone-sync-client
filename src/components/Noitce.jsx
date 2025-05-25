import "./Notice.css"
 
const Notice = () =>{
    // 나중에 실제 데이터베이스랑 연결하면 수정
    const completed = 4;
    const total = 7;
    const raw = (completed/total)*100;
    const percent = raw.toFixed(2);
    

    return (
        <div className="todayNotice">
            <div className="today_date">
                <div>Today</div>
                {new Date().toLocaleDateString()}
            </div>
            <div className="noticeBox">
                <div className="noticeFir">
                    <div className="ToExam">시험까지</div>
                    <div className="ToOneExam">
                        <div>디지털 통신</div>
                        <div>D-5</div>
                    </div>
                    <div className="ToOneExam">
                        <div>컴퓨터 구조</div>
                        <div>D-6</div>
                    </div>
                    <div className="ToOneExam">
                        <div>자료구조</div>
                        <div>D-11</div>
                    </div>
                </div>
                <div className="noticeSec">
                    <div className="Today_rate">
                        오늘의 학습률
                    </div>
                    <div className="progress-body">
                        <div
                            className="donut"
                            style={{'--pct': `${percent}`}}
                        >
                            <div className="donut-center">{percent}%</div>
                        </div>
                        <div className="progress-text">
                            {total}개 중 {completed}개 완료
                        </div>
                    </div>
                </div>
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