import React, { useState, useEffect } from 'react';
import "./Calender.css"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import Study from './Study';
import { getSchedules, deleteSchedule } from '../data/calendarService';


const Calender = ({ onAddStudy, onStartStudy, onAddExam }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);

    // selectedDate 변경 시 스케줄 로드
  useEffect(() => {
    const fetchSchedules = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');  // YYYY-MM-DD
      try {
        const list = await getSchedules(dateStr);
        setSchedules(list);
      } catch (err) {
        console.error('스케줄 로드 실패:', err);
        setSchedules([]);
      }
    };
    fetchSchedules();
  }, [selectedDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteSchedule(id);
      // 삭제 후 재조회
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const list = await getSchedules(dateStr);
      setSchedules(list);
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
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const rows = [];
        let days = [];
        let day = startDate;
    
        while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
            const clone = day;
            days.push(
              <div
                key={clone}
                className={`cell ${!isSameMonth(clone, monthStart) ? 'disabled' : ''} ${isSameDay(clone, selectedDate) ? 'selected' : ''}`}
                onClick={() => setSelectedDate(clone)}
              >
                {format(clone, 'd')}
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
                        <button onClick={()=>onAddStudy()}>+ 학습추가</button>
                        <button onClick={()=>onAddExam()}>+ 시험추가</button>
                    </div>
                </div>
                <div>
                  <Study 
                    schedules={schedules}
                    onDelete={handleDelete}
                    onStartStudy={onStartStudy}
                  />
                </div>
            </div>
        </div>
    )
}

export default Calender;