import React, { useState, useEffect } from 'react';
import "./Calender.css"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, differenceInCalendarDays } from 'date-fns';
import Study from './Study';

// 캘린더랑 todaytodo 합치는게 좋을거 같음

const Calender = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());



    const renderHeader = () => (
        <div className="CalHeader">
            <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>◀</button>
            <h2>{format(currentMonth, 'MMMM')}</h2>
            <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>▶</button>
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
            <div className="calender">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>
            <div className="detail">
                <div className="detailDate">
                    {format(selectedDate, 'MM월 dd일')}
                    <div className="addDetail">
                        <button>+ 학습추가</button>
                        <button>+ 시험추가</button>
                    </div>
                </div>
                <div>
                  <Study />
                </div>
            </div>
        </div>
    )
}

export default Calender;