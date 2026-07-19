// 공항 주차장 층/구역별 잔여 대수 — 공공데이터포털 API 연동 (외부 의존성 없음)
// GET /.netlify/functions/airport?code=ICN1|ICN2|GMP|CJU|PUS
//
// 사용 API (둘 다 data.go.kr에서 활용신청 → 같은 인증키 사용 가능):
//  1) 인천국제공항공사_주차 정보:  https://www.data.go.kr/data/15095047/openapi.do
//     GET apis.data.go.kr/B551177/StatusOfParking/getTrackingParking?serviceKey=..&numOfRows=50&pageNo=1&type=json
//     응답 item: { floor: "T1 단기 지하1층", parking: 현재 주차대수, parkingarea: 전체 면수, datetm }
//  2) 한국공항공사_전국공항 실시간 주차정보: https://www.data.go.kr/data/15056803/openapi.do
//     (김포·제주·김해 등 14개 공항. 필드명은 키 발급 후 응답 보고 아래 pick() 후보에 추가 조정)
//
// 환경변수: DATA_GO_KR_KEY (공공데이터포털 일반 인증키, URL-인코딩 안 된 Decoding 키 권장)
import { AIRPORTS, nowKST } from "./_shared.mjs";

const CACHE_MS = 5 * 60 * 1000; // 공항은 5분 캐시
const cache = new Map(); // code -> {ts, data}

// ── 도배 방지 ──
const RL_WINDOW = 60 * 1000, RL_MAX = 40;
const rlMap = new Map();
function rateLimited(ip) {
  const now = Date.now();
  if (rlMap.size > 5000) rlMap.clear();
  const e = rlMap.get(ip);
  if (!e || now - e.start > RL_WINDOW) { rlMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > RL_MAX;
}
function clientIP(req) {
  return req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}

// 여러 후보 필드명 중 있는 것 반환 (공공 API 필드명 편차 대응)
function pick(obj, keys) {
  for (const k of keys) if (obj[k] != null && obj[k] !== "") return obj[k];
  return null;
}
function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }

// 잔여율 → 상태 라벨/색
function lotStatus(remain, total) {
  if (total == null || remain == null) return ["확인불가", "#95a5a6"];
  if (remain <= 0) return ["만차", "#e74c3c"];
  const pct = remain / total;
  if (pct < 0.1) return ["거의만차", "#e74c3c"];
  if (pct < 0.3) return ["혼잡", "#f1c40f"];
  return ["여유", "#2ecc71"];
}

function normalizeLot(name, occupied, total) {
  const remain = (total != null && occupied != null) ? Math.max(0, total - occupied) : null;
  const [label, hex] = lotStatus(remain, total);
  return { lot: name, total, occupied, remain, label, hex };
}

function demoLots(airport) {
  const defs = airport.src === "icn"
    ? ["단기 지하1층", "단기 지하2층", "단기 지상", "장기 P1", "장기 P2", "주차타워"]
    : ["국내선 P1", "국내선 P2", "국제선", "화물청사"];
  return defs.map((n) => {
    const total = 400 + Math.floor(Math.random() * 1600);
    const occupied = Math.floor(total * (0.4 + Math.random() * 0.65));
    return normalizeLot(n, Math.min(occupied, total), total);
  });
}

// ── 인천공항: 층/구역별 현황 ──
async function fetchICN(key, filter) {
  const url = `https://apis.data.go.kr/B551177/StatusOfParking/getTrackingParking?serviceKey=${encodeURIComponent(key)}&numOfRows=60&pageNo=1&type=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("icn " + res.status);
  const d = await res.json();
  const items = d?.response?.body?.items || d?.items || [];
  const arr = Array.isArray(items) ? items : (items.item ? [].concat(items.item) : []);
  return arr
    .filter((it) => String(pick(it, ["floor", "명칭"]) || "").toUpperCase().includes(filter))
    .map((it) => {
      const name = String(pick(it, ["floor"]) || "").replace(/^T[12]\s*/i, "");
      const occupied = toInt(pick(it, ["parking"]));
      const total = toInt(pick(it, ["parkingarea"]));
      return normalizeLot(name || "주차장", occupied, total);
    });
}

// ── 인천공항: 출국장 시간대별 예상 승객(승객예고) ──
// 인천국제공항공사_승객예고-출·입국장별: https://www.data.go.kr/data/15095066/openapi.do
// ※ 응답 필드명이 조정될 수 있음. 실패해도 주차장 정보는 정상 표시(부가 정보라 조용히 생략).
async function fetchDepForecast(key, terminal) {
  const url = `https://apis.data.go.kr/B551177/PassengerNoticeKR/getfPassengerNoticeIKR?serviceKey=${encodeURIComponent(key)}&selectdate=0&type=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  const items = d?.response?.body?.items;
  const arr = items ? [].concat(items.item || items) : [];
  if (!arr.length) return null;
  // 현재 KST 시간이 포함된 시간대(atime: "6_7" / "06_07" 형태) 찾기
  const h = new Date(Date.now() + 9 * 3600 * 1000).getUTCHours();
  const slot = arr.find((it) => {
    const a = String(it.atime || "").split("_").map((x) => parseInt(x, 10));
    return a.length === 2 && h >= a[0] && h < a[1];
  }) || arr[0];
  // t1/t2로 시작하는 출국 인원 필드 합산 (t1sum1, t1sumset1 등 편차 대응)
  const prefix = terminal === "T2" ? "t2" : "t1";
  let total = 0, found = false;
  for (const [k, v] of Object.entries(slot)) {
    if (new RegExp(`^${prefix}sum`, "i").test(k)) {
      const n = parseFloat(v);
      if (Number.isFinite(n)) { total += n; found = true; }
    }
  }
  if (!found) return null;
  total = Math.round(total);
  const [label, hex] = total < 2500 ? ["여유", "#2ecc71"] : total < 4500 ? ["보통", "#f1c40f"] : ["혼잡", "#e74c3c"];
  return { count: total, label, hex, slot: String(slot.atime || "") };
}

// ── 한국공항공사(김포·제주·김해): 주차장별 현황 ──
async function fetchKAC(key, airportCode) {
  const url = `https://openapi.airport.co.kr/service/rest/AirportParking/airportparkingRT?serviceKey=${encodeURIComponent(key)}&schAirportCode=${airportCode}&numOfRows=30&pageNo=1&_type=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("kac " + res.status);
  const d = await res.json();
  const items = d?.response?.body?.items;
  const arr = items ? [].concat(items.item || items) : [];
  return arr.map((it) => {
    const name = String(pick(it, ["parkingAirportCodeName", "parkingFloor", "parkingLotName", "aprKor"]) || "주차장");
    const occupied = toInt(pick(it, ["parkingIstay", "parking", "occupied"]));
    const total = toInt(pick(it, ["parkingFullSpace", "parkingarea", "total"]));
    return normalizeLot(name, occupied, total);
  });
}

export default async (req) => {
  const code = new URL(req.url).searchParams.get("code");
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) return json({ error: "unknown airport" }, 404);

  if (rateLimited(clientIP(req))) {
    return json({ error: "rate", message: "잠시 후 다시 시도해 주세요." }, 429);
  }

  const cached = cache.get(code);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return json({ ...cached.data, cached: true });
  }

  const key = process.env.DATA_GO_KR_KEY;
  if (!key) {
    const demoDep = airport.src === "icn"
      ? (() => { const c = 1500 + Math.floor(Math.random() * 4500);
          const [label, hex] = c < 2500 ? ["여유", "#2ecc71"] : c < 4500 ? ["보통", "#f1c40f"] : ["혼잡", "#e74c3c"];
          return { count: c, label, hex }; })()
      : null;
    return json({ code, name: airport.name, lots: demoLots(airport), dep: demoDep, updated: nowKST(), demo: true, reason: "no-key" });
  }

  try {
    const lots = airport.src === "icn"
      ? await fetchICN(key, airport.filter)
      : await fetchKAC(key, airport.airportCode);
    if (!lots.length) throw new Error("empty");
    // 인천공항이면 출국장 예상 승객도 함께 (실패해도 무시)
    let dep = null;
    if (airport.src === "icn") {
      try { dep = await fetchDepForecast(key, airport.filter); } catch { dep = null; }
    }
    const data = { code, name: airport.name, lots, dep, updated: nowKST() };
    cache.set(code, { ts: Date.now(), data });
    return json(data);
  } catch (e) {
    return json({ code, name: airport.name, lots: demoLots(airport), updated: nowKST(), demo: true, reason: String(e.message || e) });
  }
};
