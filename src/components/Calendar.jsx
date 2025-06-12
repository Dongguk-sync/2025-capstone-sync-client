import React, { useState, useEffect } from 'react';
import "./Calendar.css"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import Study from './Study';
import {FaTrash} from 'react-icons/fa'
import testImage from "../assets/test.png";
import  { getCurrentUser } from '../api/axios';
import axios from 'axios';

// 임시(학습)
// import { getSchedulesInRange as getMockStudies } from '../data/calendarService';


const Calendar = ({onAddSchedule , onStartStudy, reloadTrigger, onReload }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthSchedules, setMonthSchedules] = useState({});
    const [dailySchedules, setDailySchedules] = useState([]);
    const [examSchedules, setExamSchedules] = useState([]);
    const [monthExams, setMonthExams] = useState({});


    useEffect(() => {
    // console.log("calendar useEffect", reloadTrigger);
    (async () => {
      try {
        const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const monthEnd   = format(endOfMonth(currentMonth),   'yyyy-MM-dd');

        // 1) 유저 정보
        const userRes = await getCurrentUser();
        const userId  = userRes.content.user_id;
        const token = localStorage.getItem('accessToken');

        // 2) 학습일정 전체
        const studiesRes = await axios.get(
          `/api/study-schedules/user-id/${userId}`,
                {headers: {Authorization: `Bearer ${token}`}}
        );
        const allStudies = Array.isArray(studiesRes.data.content)
          ? studiesRes.data.content
          : [studiesRes.data.content];

        // 3) 시험일정 전체      
        const examsRes = await axios.get(
          `/api/exam-schedules/user-id/${userId}`,
          {headers: {Authorization: `Bearer ${token}`}}
        );
        // console.log('allExams raw: ', examsRes.data.content);
        const allExams = Array.isArray(examsRes.data.content)
          ? examsRes.data.content
          : [examsRes.data.content];

        // — 학습: 월간 범위 필터 + 날짜별 맵핑
        const filteredStudies = allStudies.filter(item =>
          item.study_schedule_date >= monthStart && 
          item.study_schedule_date <= monthEnd
        );
        const studyMap = filteredStudies.reduce((acc, item) => {
          const key = item.study_schedule_date;
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {});
        setMonthSchedules(studyMap);

        // — 시험: 월간 범위 필터 + 날짜별 맵핑
        const filteredExams = allExams.filter(item =>
          item.exam_schedule_date >= monthStart &&
          item.exam_schedule_date <= monthEnd
        );
        const examMap = filteredExams.reduce((acc, item) => {
          const key = item.exam_schedule_date;
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {});
        setMonthExams(examMap);

      } catch (err) {
        console.error('월간 데이터 로드 실패', err);
        setMonthSchedules({});
        setMonthExams({});
      }
    })();
  }, [currentMonth, reloadTrigger]);

    // --- 선택된 날짜 일간 학습+시험 필터링 ---
  useEffect(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    setDailySchedules(monthSchedules[key] || []);
    setExamSchedules(monthExams[key] || []);
  }, [selectedDate, monthSchedules, monthExams]);

 // --- 학습 삭제 ---
  const handleDelete = async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await axios.delete(
      `/api/study-schedules/id/${id}`,
      {headers: {Authorization: `Bearer ${token}`}}

    );
    onReload(); // 부모에 reloadTrigger 변화를 알려 전체 재요청
  };

  // --- 시험 삭제 ---
  const handleExamDelete = async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await axios.delete(
      `/api/exam-schedules/${id}`,
      {headers: {Authorization: `Bearer ${token}`}}

    );
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
          {/* 왼쪽 달력 부분 */}
            <div className="calendar">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>


          {/* 오른쪽 학습 일정 부분 */}
            <div className="detail">
                <div className="detailDate">
                    {format(selectedDate, 'MM월 dd일')}
                    <div className="addDetail">
                        <button onClick={()=>onAddSchedule()} className="StudyButton">+ 일정추가</button>
                    </div>
                </div>
    
                {examSchedules.length > 0 && (
                  <div className="examSection">
                    {/* 라벨 */}
                    <div className="examLabel">시험 일정</div>
                    {/* 각 시험 항목 */}
                    {examSchedules.map(ex => (
                      <div key={ex.exam_schedule_id} className="ExamItem">
                        <div className="ExamTitle">
                          <img src={testImage} className="testIcon" alt="시험 아이콘" />
                          <span>{ex.exam_schedule_name}</span>
                        </div>
                        <button
                          onClick={() => handleExamDelete(ex.exam_schedule_id)}
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
                    // onViewResult={}
                    // 나중에 교안관리 완성되고 결과 페이지
                    // 완성되면 연결
                  />
                </div>
            </div>
        </div>
    )
}

export default Calendar;