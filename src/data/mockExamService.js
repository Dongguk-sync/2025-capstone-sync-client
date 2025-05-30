// src/data/mockExamService.js

const STORAGE_KEY = 'mockExams';

function initStorage() {
  // 로컬스토리지에 아무 값도 없으면, 빈 배열로 초기화
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

async function getAllExams() {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

/** 특정 날짜의 시험만 */
export async function getExamsByDate(date) {
  const all = await getAllExams();
  return all.filter(e => e.date === date);
}

/** 한 달치 시험 범위 */
export async function getExamsInRange(start, end) {
  const all = await getAllExams();
  return all.filter(e => e.date >= start && e.date <= end);
}

/** 새 시험 등록 */
export async function saveExams(exam) {
  const all = await getAllExams();
  const nextId = all.length ? Math.max(...all.map(e => e.id)) + 1 : 1;
  const newExam = { id: nextId, ...exam };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...all, newExam]));
  return newExam;
}

/** 시험 삭제 */
export async function deleteExam(id) {
  const all = await getAllExams();
  const next = all.filter(e => e.id !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
