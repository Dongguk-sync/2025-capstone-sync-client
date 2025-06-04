
// 키 이름은 아무렇게나 정하시면 됩니다
const STORAGE_KEY = 'mockStudies';


async function getAll() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

export async function getSchedulesInRange(start, end) {
  const all = await getAll();
  return all.filter(item => item.date >= start && item.date <= end);
}

/**
 * 특정 날짜(YYYY-MM-DD)에 해당하는 스터디만 필터링해서 돌려줍니다.
 */
export async function getSchedulesByDate(date) {
  const all = await getAll();
  return all.filter(item => item.date === date);
}

/**
 * 새로운 스터디를 저장하고, 저장된 오브젝트을 반환합니다.
 */
export async function saveSchedule(schedule) {
    const all = await getAll();
  // 1) 기존 데이터들 중 가장 큰 id를 찾아서 +1
  const nextId = all.length
    ? Math.max(...all.map(s => s.id)) + 1
    : 1;
  // 2) 새 객체에 id 추가
  const newSchedule = { id: nextId, ...schedule };
  const next = [...all, newSchedule];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return newSchedule;
}

// 일정 삭제 (여기서 내보냅니다!)
export async function deleteSchedule(id) {
  const all = await getAll();
  const numId = Number(id);
  const next = all.filter(item => item.id !== numId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}