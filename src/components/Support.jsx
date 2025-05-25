import '../pages/Profile.css'

export default function Support() {
    return (
        <div className="support">
            <div className="FAQ">
                <label>FAQ</label>
                <div className="FAQ_content">
                    질문사항
                </div>
            </div>

            <div className="suggest">
                <label>문의 및 제안</label>
                <textarea
                    type="text"
                    placeholder="소중한 의견을 들려주세요"
                    className="suggest_input"
                />
                <button className="suggets_submit">제출</button>
            </div>
        </div>
    )
}