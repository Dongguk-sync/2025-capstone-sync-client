import React, { useState, useEffect } from 'react';
import "./Calender.css"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import Study from './Study';
// import { getSchedulesInRange, deleteSchedule } from '../data/calendarService';
import { getSchedulesInRange, deleteSchedule } from '../data/mockStudyService';


const Calender = ({ onAddStudy, onStartStudy, onAddExam }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthSchedules, setMonthSchedules] = useState({});

    // 한달치 달력에 표기할 일정
    useEffect(() => {
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd   = format(endOfMonth(currentMonth),   'yyyy-MM-dd');

      async function fetchMonth() {
        try {
          const list = await getSchedulesInRange(monthStart, monthEnd);
          const map  = list.reduce((acc, item) => {
            if (!acc[item.date]) acc[item.date] = [];
            acc[item.date].push(item);
            return acc;
          }, {});
          setMonthSchedules(map);
        } catch (err) {
          console.error('월간 스케줄 로드 실패', err);
          setMonthSchedules({});
        }
      }
      fetchMonth();
    }, [currentMonth]);

  

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteSchedule(id);
      // 삭제 후 재조회
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const list = await getSchedulesInRange(dateStr);
      setMonthSchedules(list);
    } catch (err) {
      console.error('삭제 실패:', err);
    }
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

        days.push(
          <div
            key={clone}
            className={`
              cell
              ${!isSameMonth(clone, monthStart) ? 'disabled' : ''}
              ${isSameDay(clone, selectedDate) ? 'selected' : ''}
            `}
            onClick={() => setSelectedDate(clone)}
          >
            <div className="cell-date">{format(clone, 'd')}</div>

          {events.length > 0 && (
            <div className="cell-count">
              학습 {events.length}개
            </div>
          )}

          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="cells">{rows}</div>;
  };
  
  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedSchedules = monthSchedules[selectedKey] || [];


    return ( 
        <div className="mainStudy">
          {/* 오른쪽 달력 부분 */}
            <div className="calender">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>


          {/* 왼쪽 학습 일정 부분 */}
            <div className="detail">
                <div className="detailDate">
                    {format(selectedDate, 'MM월 dd일')}
                    <div className="addDetail">
                        <button onClick={()=>onAddStudy()} className="StudyButton">+ 학습추가</button>
                        <button onClick={()=>onAddExam()} className="StudyButton">+ 시험추가</button>
                    </div>
                </div>
                <div>
                  <Study 
                    schedules={selectedSchedules}
                    onDelete={handleDelete}
                    onStartStudy={onStartStudy}
                  />
                </div>
            </div>
        </div>
    )
}

export default Calender;