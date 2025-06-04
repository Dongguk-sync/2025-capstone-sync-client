import { useState, useEffect } from 'react';
import "./Notice.css"
import instance from '../api/axios';
 
const Notice = () =>{

    const [dDays, setDDays] = useState([]);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [studyDays, setStudyDays] = useState(0);

     useEffect(() => {
        // (1) 시험 일정 불러오기
        instance.get('/exam-schedules')
        .then(res => {
            const exams = res.data.content;

            if (!Array.isArray(exams)) {
                console.error("exam-schedules 응답이 배열이 아님:", exams);
                return;
            }
            const today = new Date();
            const withDDay = exams.map((item, index) => {
                const examDate = new Date(item.exam_schedule_date);
                const diffTime = examDate - today;
                const dday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    subject: item.exam_schedule_name,
                    dday,
                    key: index // 렌더링 오류 방지용
                };
            });

            setDDays(withDDay);
        })
        .catch(err => console.error(err));


        // (2) 오늘 학습률
        instance.get('/api/studys/today/progress')
        .then(res => {
            setCompleted(res.data.completed);
            setTotal(res.data.total);
        })
        .catch(err => console.error(err));

        // (3) 학습 시작일
        instance.get('/api/user/study-days')
        .then(res => setStudyDays(res.data.days))
        .catch(err => console.error(err));
    }, []);

    const top3Exams = Array.isArray(dDays)
        ? [...dDays].sort((a, b) => a.dday - b.dday).slice(0, 3)
        : [];

    const percent = total === 0 ? 0 : ((completed / total) * 100).toFixed(2);

    return (
        <div className="todayNotice">
            <div className="today_date">
                <div>Today</div>
                {new Date().toLocaleDateString()}
            </div>
            <div className="noticeBox">
                {/* 시험까지 D-day */}
                {top3Exams.map((item, index) => (
            <div className="ToOneExam" key={`${item.subject}-${index}`}>
              <div>{item.subject}</div>
              <div>{item.dday >= 0 ? `D-${item.dday}` : `종료됨`}</div>
            </div>
          ))}

                {/* <div className="noticeFir">
                    <div className="ToExam">시험까지</div>
                    {Array.isArray(dDays) && dDays.map((item, index) => (
                        <div className="ToOneExam" key = {`${item.subject} - ${index}`}>
                            <div>{item.subject}</div>
                            <div>{item.dday >= 0 ? `D-${item.dday}` : `종료됨`}</div>
                        </div>
                    ))}
                </div> */}

                {/* 오늘의 학습률 */}
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

                {/* 환영인사 */}
                <div className="noticeThi">
                    <div className="hello">
                    sync님, 환영해요😄<br/>오늘 하루도 힘내서 공부해봅시다.
                    </div>
                    <div className="contiDate">
                        백지 학습 {studyDays}일 째
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notice;