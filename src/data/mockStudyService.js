// 학습 추가시 저장하기 위한 임시 파일


import { dummyStudySchedules } from "./dummySchedules";
// 키 이름은 아무렇게나 정하시면 됩니다
const STORAGE_KEY = 'mockStudies';

function initStorage() {
    if(!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyStudySchedules));
    }
}

async function getAll() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

export async function getSchedulesInRange(start, end) {
  const all = await getAll();
  return all.filter(item => item.date >= start && item.date <= end);
}

/**
 * 특정 날짜(YYYY-MM-DD)에 해당하는 스터디만 필터링해서 돌려줍니다.
 */
export async function getStudiesByDate(date) {
  const all = await getAll();
  return all.filter(item => item.date === date);
}

/**
 * 새로운 스터디를 저장하고, 저장된 오브젝트을 반환합니다.
 */
export async function saveSchedule(schedule) {
  const all = await getAll();
  const next = [...all, schedule];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return schedule;
}

// 일정 삭제 (여기서 내보냅니다!)
export async function deleteSchedule(id) {
  initStorage();
  const all = await getAll();
  const next = all.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { ok: true };
}