import instance from "./axios";

export function saveExam (payload) {
    return instance
        .post('/exam-schedules', {
        exam_schedule_date: payload.date,
        exam_schedule_name: payload.title,
        subject_id: payload.subjectId
    })
    .then(res => res.data);
}

// export const getExamByDate = (date) => {
//     instance.get(`/exam-schedule/date/${date}`)
// }