// src/data/calendarService.js
import { dummyStudySchedules } from '../data/dummySchedules';

// 환경변수나 플래그로 전환할 수 있게
const USE_MOCK = true;

/**
 * 주어진 YYYY-MM-DD 날짜의 일정 목록을 가져옵니다.
 * - mock: dummySchedules 필터링
 * - real: 실제 백엔드 /api/schedules?date=YYYY-MM-DD 호출
 */
export async function getSchedules(date) {
  if (USE_MOCK) {
    // 아주 짧은 지연을 흉내 내도 좋습니다.
    await new Promise(r => setTimeout(r, 200));
    return dummyStudySchedules.filter(item => item.date === date);
  }
  // 실제 API 호출 (나중에 연결)
  const res = await fetch(`/api/schedules?date=${date}`);
  if (!res.ok) throw new Error('스케줄 조회 실패');
  return res.json();
}

/**
 * 범위(start~end, YYYY-MM-DD) 내 일정 목록
 */
export async function getSchedulesInRange(start, end) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return dummyStudySchedules.filter(item =>
      item.date >= start && item.date <= end
    );
  }
  // 백엔드가 start/end 쿼리를 지원한다면:
  const res = await fetch(`/api/schedules?start=${start}&end=${end}`);
  if (!res.ok) throw new Error('스케줄 범위 조회 실패');
  return res.json();
}

/**
 * 일정 삭제
 */
export async function deleteSchedule(id) {
  if (USE_MOCK) {
    // mock에서는 실제로 파일을 변경하지 않고 성공 리턴
    await new Promise(r => setTimeout(r, 100));
    return { ok: true };
  }
  const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('삭제 실패');
  return res.json();
}
