// 혼잡 관측 데이터 축적 + 제로트래픽 시각 계산 (Netlify Blobs)
// - 방문자가 카드를 탭해 실측이 생길 때마다 recordObservation()으로 요일×30분 슬롯 집계에 누적
// - zeroTimeToday()는 최근 4주 같은 요일 데이터에서 "이 시각 이후 전부 원활"인 가장 이른 시각을 계산
// - Blobs 실패(로컬 실행 등)는 전부 조용히 무시 → 본 기능(혼잡도 표시)에 영향 없음
import { getStore } from "@netlify/blobs";

const TZ = 9 * 3600 * 1000; // KST

export function kstNow() { return new Date(Date.now() + TZ); }

// 해당 주의 월요일 날짜(YYYY-MM-DD)를 주 키로 사용
export function weekKey(d = kstNow()) {
  const day = (d.getUTCDay() + 6) % 7; // 월=0
  const mon = new Date(d.getTime() - day * 86400000);
  return mon.toISOString().slice(0, 10);
}
export function prevWeekKeys(count = 4) {
  const keys = [];
  const now = kstNow();
  for (let i = 0; i < count; i++) keys.push(weekKey(new Date(now.getTime() - i * 7 * 86400000)));
  return keys;
}
export function slotOf(d = kstNow()) {
  const h = String(d.getUTCHours()).padStart(2, "0");
  return `${h}:${d.getUTCMinutes() < 30 ? "00" : "30"}`;
}
export function dowOf(d = kstNow()) { return d.getUTCDay(); } // 0=일

function statsStore() { return getStore("traffic-stats"); }
function aggKey(cat, name, wk) { return `agg/${cat}/${encodeURIComponent(name)}/${wk}`; }

// 관측 1건 누적: 슬롯당 [관측수, 원활수]
export async function recordObservation(cat, name, congestion) {
  try {
    const s = statsStore();
    const key = aggKey(cat, name, weekKey());
    const data = (await s.get(key, { type: "json" })) || {};
    const dow = String(dowOf());
    const slot = slotOf();
    data[dow] = data[dow] || {};
    const cell = data[dow][slot] || [0, 0];
    cell[0] += 1;
    if (congestion <= 1) cell[1] += 1; // 0(정보없음)·1(원활) = 한산으로 집계
    data[dow][slot] = cell;
    await s.setJSON(key, data);
  } catch { /* 집계 실패는 무시 */ }
}

// 슬롯 병합 데이터에서 제로트래픽 시각 계산 (테스트 가능하도록 분리)
export function computeZeroTime(merged, closeHour = 22) {
  const closeStr = `${String(closeHour).padStart(2, "0")}:00`;
  const slots = Object.keys(merged).filter((t) => t >= "15:00" && t < closeStr).sort();
  let best = null, tailN = 0;
  for (let i = slots.length - 1; i >= 0; i--) {
    const [n, f] = merged[slots[i]];
    if (n > 0 && f === n) { tailN += n; best = slots[i]; }
    else break; // 원활이 아닌 관측을 만나면 중단
  }
  return (best && tailN >= 3) ? { time: best, samples: tailN } : null;
}

const ztMemo = new Map(); // 인스턴스 메모 (1시간)
export async function zeroTimeToday(cat, name, closeHour = 22) {
  const dow = dowOf();
  const memoKey = `${cat}:${name}:${dow}:${weekKey()}`;
  const memo = ztMemo.get(memoKey);
  if (memo && Date.now() - memo.ts < 3600e3) return memo.val;

  let val = null;
  try {
    const s = statsStore();
    const merged = {};
    for (const wk of prevWeekKeys(4)) {
      const d = await s.get(aggKey(cat, name, wk), { type: "json" });
      const day = d && d[String(dow)];
      if (!day) continue;
      for (const [slot, cell] of Object.entries(day)) {
        const c = merged[slot] || [0, 0];
        c[0] += cell[0]; c[1] += cell[1];
        merged[slot] = c;
      }
    }
    val = computeZeroTime(merged, closeHour);
  } catch { val = null; }

  if (ztMemo.size > 2000) ztMemo.clear();
  ztMemo.set(memoKey, { ts: Date.now(), val });
  return val;
}
