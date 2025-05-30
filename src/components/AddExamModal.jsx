export default function AddExamModal({
    examTitle, 
    subject, 
    setExamTitle, 
    onSubjectSelect, 
    onSubmit
}) {
    return (
        <div className="AddExamDetail">
                <div className="AddExamTitle">
                  <label>시험명</label>
                  <input 
                    type="text"
                    placeholder="시험명을 입력하세요"
                    value={examTitle ?? ''}
                    onChange={e => setExamTitle(e.target.value)}
                  />
                </div>

                <div className="SelectSubject">
                  <div className="SelectSubject-row">
                    <label>과목</label>
                    <input
                      type="text"
                      value={subject?.name || ''}
                      readOnly
                      placeholder="과목 선택"
                    />
                  </div>
                <button 
                  className="SelectSubject-btn"
                //   onClick={() => openModal('searchSubject')}
                    onClick={onSubjectSelect}
                  >과목 선택</button>
              </div>
              {/* <div>
                <div className="Alarm">
                  <label>시험 전 학습 자동 생성</label>
                  <OnOffToggle />
                </div>
                <div className="Alarm">
                  <label>학습 알림</label>
                  <OnOffToggle />
                </div>
              </div> */}
              <button 
                className="AddStudySubmit"
                onClick={onSubmit}
              >등록
              </button>
              </div>
    )
}