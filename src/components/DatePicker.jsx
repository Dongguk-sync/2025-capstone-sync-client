import React, {useState, useEffect, useMemo} from 'react'
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'

export default function DatePicker({selected, onChange}) {
  const [date, setDate] = useState(selected || new Date())

  useEffect(()=> {
    if(selected) setDate(selected)
  }, [selected])

  const today = useMemo(()=> new Date(), [])

  const handleChange = d => {
    setDate(d)
    if (onChange) onChange(d)
  }

  return (
    <ReactDatePicker
        inline
        shouldCloseOnSelect={false}
        dateFormat="yyyy/MM/dd"
        selected={date}
        onChange={handleChange}
        minDate={today}
        className="Datepicker"
        placeholderText="날짜를 입력해 주세요"
        renderCustomHeader={({  
        monthDate,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="custom-header">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
          >
            {'<'}
          </button>
          <span>
            {monthDate.getMonth() + 1}월 {monthDate.getFullYear()}년
          </span>
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
          >
            {'>'}
          </button>
        </div>
      )}
    />
  )
}