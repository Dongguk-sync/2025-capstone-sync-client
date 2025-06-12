import { useState, useEffect } from 'react';
import "./Notice.css"
import instance from '../api/axios';
import { getCurrentUser } from '../api/axios';
 

const Notice = ({ reloadTrigger }) =>{

    const [dDays, setDDays] = useState([]);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [studyDays, setStudyDays] = useState(0);
    const [userName, setUserName] = useState('');

    
    useEffect(() => {
        getCurrentUser()
            .then(user => {
                const content = user.content || {};
                const {
                    user_id,
                    user_name,
                    user_studied_days,
                    user_completed_studys,
                    user_total_studys
                } = content;

                if (user_name) setUserName(user_name);
                if (user_studied_days != null) setStudyDays(user_studied_days);
                if (user_completed_studys != null) setCompleted(user_completed_studys);
                if (user_total_studys != null) setTotal(user_total_studys);

                return instance.get(`/exam-schedules/user-id/${user_id}`);
            })

            .then(res => {
                const raw = res?.data?.content;
                let exams = Array.isArray(raw) ? raw : [raw];
                const today = new Date();
                today.setHours(0,0,0,0);
                const withDDay = exams.map((item, index) => {
                    const examDate = new Date(item.exam_schedule_date);
                    examDate.setHours(0,0,0,0);
                    const diffTime = examDate - today;
                    const dday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return {
                        subject: item.exam_schedule_name,
                        dday,
                        key: index 
                    };
                });
                setDDays(withDDay);
            })
            .catch(err => console.error('데이터 로드 실패:', err));
    }, [reloadTrigger]);

    const upcomingExams = Array.isArray(dDays)
    ? dDays
        .filter(item => item.dday >= 0)          // 종료된 항목 제거
        .sort((a, b) => a.dday - b.dday)          // 오름차순 정렬
        .slice(0, 3)                              // 상위 3개만 취함
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
                {/* 가장가까운 시험 3개만 표출됩니다. */}
                <div className="noticeFir">
                    <div className="ToExam">시험까지</div>
                    {upcomingExams.length > 0 ? ( 
                        upcomingExams.map((item, index) => (
                            <div className="ToOneExam" key={`${item.subject}-${index}`}>
                                <div className="subject">{item.subject}</div>
                                <div className={`dday ${item.dday === 0 ? 'dday-today' : ''}`}>
                                    {item.dday === 0 ? 'D-day' :`D-${item.dday}`}
                                </div>
                            </div>
                        ))
                    ):(<div className="no-exams">예정된 시험이 없습니다.</div>)
                    }   
                </div>

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
                    {userName}님, 환영해요😄<br/>오늘 하루도 힘내서 공부해봅시다.
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