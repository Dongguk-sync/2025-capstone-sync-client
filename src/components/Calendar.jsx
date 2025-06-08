import React, { useState, useEffect } from 'react';
import "./Calendar.css"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import Study from './Study';
// import { getSchedulesInRange, deleteSchedule } from '../data/calendarService';
import { getSchedulesByDate, getSchedulesInRange, deleteSchedule } from '../data/mockStudyService';
import { getExamsByDate, deleteExam, getExamsInRange } from "../data/mockExamService";
import {FaTrash} from 'react-icons/fa'
import testImage from "../assets/test.png";
// import instance, { getCurrentUser } from '../api/axios';



const Calendar = ({onAddSchedule , onStartStudy, reloadTrigger, onReload }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthSchedules, setMonthSchedules] = useState({});
    const [dailySchedules, setDailySchedules] = useState([]);
    const [examSchedules, setExamSchedules] = useState([]);
    const [monthExams, setMonthExams] = useState({});

    // 1) 월간 스케줄 + 월간 시험을 한 번에 불러오기
    useEffect(() => {
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd   = format(endOfMonth(currentMonth),   'yyyy-MM-dd');

      async function fetchMonthData() {
        try {
          const [studies, exams] = await Promise.all([
            getSchedulesInRange(monthStart, monthEnd),
            getExamsInRange(   monthStart, monthEnd)
          ]);

          const toMap = list =>
            list.reduce((acc, item) => {
              acc[item.date] = acc[item.date] || [];
              acc[item.date].push(item);
              return acc;
            }, {});
          
          setMonthSchedules(toMap(studies));
          setMonthExams(     toMap(exams)   );
        } catch (err) {
          console.error('월간 데이터 로드 실패', err);
          setMonthSchedules({});
          setMonthExams({});
        }
      }

      fetchMonthData();
    }, [currentMonth, reloadTrigger]);
  //   useEffect(() => {
  //   getCurrentUser()
  //     .then(user => {
  //       // getCurrentUser 반환 객체의 content 필드 사용
  //       const userId = user.user_id;
  //       const token = localStorage.getItem('accessToken');

  //       return instance.get(
  //         '/exam-schedules',
  //         {headers: {
  //           Authorization: `Bearer ${token}`
  //         }}
  //       )
  //         .then(res => ({data: res.data.conetent, userId}));
  //     })
  //     .then(({ exams, userId }) => {
  //       let list = exams;
  //       if (!Array.isArray(list)) list = [list];
  //       // 필터: 사용자별
  //       const userExams = list.filter(item => item.user_id === userId);
  //       // 월간 그룹핑
  //       const map = userExams.reduce((acc, item) => {
  //         const key = item.exam_schedule_date;
  //         acc[key] = acc[key] || [];
  //         acc[key].push(item);
  //         return acc;
  //       }, {});
  //       setMonthExams(map);
  //     })
  //     .catch(err => {
  //       console.error('월간 시험 일정 로드 실패', err);
  //       setMonthExams({});
  //     });
  // }, [currentMonth, reloadTrigger]);

      
    // 2) 선택된 날짜의 스케줄 + 시험을 한 번에 불러오기
    useEffect(() => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      async function fetchDayData() {
        try {
          const [dayStudies, dayExams] = await Promise.all([
            getSchedulesByDate(dateStr),
            getExamsByDate(       dateStr)
          ]);
          setDailySchedules(dayStudies);
          setExamSchedules(     dayExams   );
        } catch (err) {
          console.error('일간 데이터 로드 실패', err);
          setDailySchedules([]);
          setExamSchedules([]);
        }
      }

      fetchDayData();
    }, [selectedDate, reloadTrigger]);
    useEffect(() => {
      const key = format(selectedDate, 'yyyy-MM-dd');
      setExamSchedules(monthExams[key] || []);
    }, [selectedDate, monthExams]);




      // 학습 삭제 핸들러: localStorage 에서 지우고, 두 가지 state 모두 갱신
    const handleDelete = async (id) => {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;

      await deleteSchedule(id);

      // (a) 삭제된 날짜(Date) 와 동일한 월간 일정 다시 불러오기
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end   = format(endOfMonth(currentMonth),   'yyyy-MM-dd');
      const monthList = await getSchedulesInRange(start, end);
      const map  = monthList.reduce((acc, item) => {
        acc[item.date] = acc[item.date] || [];
        acc[item.date].push(item);
        return acc;
      }, {});
      setMonthSchedules(map);

      // (b) 현재 보고 있는 selectedDate 에 대해서만 다시 불러오기
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayList = await getSchedulesByDate(dateStr);
      setDailySchedules(dayList);
    };



      // 시험 삭제 핸들러: localStorage 에서 지우고, 두 가지 state 모두 갱신
    const handleExamDelete = async (id) => {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;

      await deleteExam(id);

      // (a) 삭제된 날짜(Date) 와 동일한 월간 일정 다시 불러오기
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end   = format(endOfMonth(currentMonth),   'yyyy-MM-dd');
      const monthList = await getExamsInRange(start, end);
      const map  = monthList.reduce((acc, item) => {
        acc[item.date] = acc[item.date] || [];
        acc[item.date].push(item);
        return acc;
      }, {});
      setMonthExams(map);

      // (b) 현재 보고 있는 selectedDate 에 대해서만 다시 불러오기
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayList = await getExamsByDate(dateStr);
      setDailySchedules(dayList);

      onReload();
    };


    const renderHeader = () => (
        <div className="CalHeader">
            <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>◀</button>
            <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>▶</button>
            <h2>{format(currentMonth, 'yyy MMMM')}</h2>
        </div>
    );

    const renderDays = () => {
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        return (
          <div className="weekdays">
            {weekDays.map((d, i) => <div key={i}>{d}</div>)}
          </div>
        );
    };

    const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd   = endOfMonth(monthStart);
    const startDate  = startOfWeek(monthStart);
    const endDate    = endOfWeek(monthEnd);

    const rows = [];
    let days   = [];
    let day    = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clone   = day;
        const dateKey = format(clone, 'yyyy-MM-dd');
        const events  = monthSchedules[dateKey] || [];
        const exams = monthExams[dateKey] || [];

        days.push(
          <div
            key={dateKey}
            className={`
              cell
              ${!isSameMonth(clone, monthStart) ? 'disabled' : ''}
              ${isSameDay(clone, selectedDate) ? 'selected' : ''}
            `}
            onClick={() => setSelectedDate(clone)}
          >
            <div className="cell-date">{format(clone, 'd')}</div>
            <div className="total_sche">
              {exams.length > 0 &&(
                <div className="exam-count">
                  시험 {exams.length}개
                </div>
              )}

              {events.length > 0 && (
                <div className="cell-count">
                  학습 {events.length}개
                </div>
              )}
            </div>


          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="cells">{rows}</div>;
  };
  


    return ( 
        <div className="mainStudy">
          {/* 오른쪽 달력 부분 */}
            <div className="calendar">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>


          {/* 왼쪽 학습 일정 부분 */}
            <div className="detail">
                <div className="detailDate">
                    {format(selectedDate, 'MM월 dd일')}
                    <div className="addDetail">
                        {/* <button onClick={()=>onAddStudy()} className="StudyButton">+ 학습추가</button>
                        <button onClick={()=>onAddExam()} className="StudyButton">+ 시험추가</button> */}
                        <button onClick={()=>onAddSchedule()} className="StudyButton">+ 일정추가</button>
                    </div>
                </div>
    
                {examSchedules.length > 0 && (
                  <div className="examSection">
                    {/* 라벨 */}
                    <div className="examLabel">시험 일정</div>
                    {/* 각 시험 항목 */}
                    {examSchedules.map(ex => (
                      <div key={ex.id} className="ExamItem">
                        <div className="ExamTitle">
                          <img src={testImage} className="testIcon" alt="" />
                          <span>{ex.title}</span>
                        </div>
                        <button
                          onClick={() => handleExamDelete(ex.id)}
                          aria-label="삭제"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}


                <div>
                  <Study 
                    schedules={dailySchedules}
                    onDelete={handleDelete}
                    onStartStudy={onStartStudy}
                  />
                </div>
            </div>
        </div>
    )
}

export default Calendar;