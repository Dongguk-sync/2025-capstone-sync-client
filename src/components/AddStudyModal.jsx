export default function AddStudyModal({
    subject, 
    material, 
    onSubjectSelect, 
    onMaterialSelect, 
    onSubmit
}) {
    return (
        <div className="AddStudyDetail">
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
                //onClick={() => openModal('searchSubject')}
                    onClick={onSubjectSelect}
                  >과목 선택</button>
                
              </div>
              <div className="SelectMeterial">
                <div className="SelectMeterial-row">
                  <label>교안</label>
                  <input
                    type="text"
                    value={material?.title || ''}
                    readOnly
                    placeholder="교안 선택"
                  />
                </div>
                <button 
                  className="SelectMeterial-btn"
                  disabled={!subject}
                //   onClick={() => openModal('searchMaterial')}
                    onClick={onMaterialSelect}
                >교안선택</button>
                
              </div>
              <button 
                className="AddStudySubmit"
                onClick={onSubmit}
              >등록
              </button>
            </div>
    )
}