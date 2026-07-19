// 온디맨드 진입로 혼잡도 조회 (외부 의존성 없음 — Netlify Drop에서 바로 동작).
// GET /.netlify/functions/store?cat=costco&name=양재점
// 방문자가 카드를 '탭'할 때만 네이버를 호출. 캐시는 함수 인스턴스 메모리(10분).
import {
  CATEGORIES, CONGESTION, QUEUE_EST_MIN,
  offsetPoint, nowKST, isBusinessHoursKST,
} from "./_shared.mjs";
import { recordObservation, zeroTimeToday } from "./_stats.mjs";

const CACHE_MS = 10 * 60 * 1000; // 10분
const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const DIRECTIONS_URL = "https://maps.apigw.ntruss.com/map-direction/v1/driving";

const liveCache = new Map(); // "cat:name" -> {ts, data}
const geoCache = new Map();  // "cat:name" -> [lon, lat]

// ── 악용 방지: IP별 속도 제한 (1분에 최대 40회) ──
const RL_WINDOW = 60 * 1000;
const RL_MAX = 40;
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
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function hdr() {
  return {
    "x-ncp-apigw-api-key-id": process.env.NCP_CLIENT_ID || "",
    "x-ncp-apigw-api-key": process.env.NCP_CLIENT_SECRET || "",
  };
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
function demoOne(cat, s, reason) {
  const r = Math.random();
  const cong = r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
  const [label, hex] = CONGESTION[cong];
  const road = Math.round((0.4 + (cong - 1) * 0.8) * 10) / 10;
  const queue = QUEUE_EST_MIN[cong];
  return { cat, name: s.name, sido: s.sido, addr: s.addr, congestion: cong, label, hex,
    lat: s.lat, lon: s.lon, road_min: road, queue_min: queue, eta_min: Math.round(road + queue),
    updated: nowKST(), demo: true, reason };
}

async function geocode(address) {
  const res = await fetch(`${GEOCODE_URL}?query=${encodeURIComponent(address)}`, { headers: hdr() });
  if (!res.ok) throw new Error("geocode " + res.status);
  const d = await res.json();
  if (!d.addresses || !d.addresses.length) return null;
  return [parseFloat(d.addresses[0].x), parseFloat(d.addresses[0].y)];
}
async function directions(lon, lat) {
  const [sLon, sLat] = offsetPoint(lon, lat, 150, 45);
  const url = `${DIRECTIONS_URL}?start=${sLon},${sLat}&goal=${lon},${lat}&option=traoptimal`;
  const res = await fetch(url, { headers: hdr() });
  if (!res.ok) throw new Error("directions " + res.status);
  const d = await res.json();
  const route = d?.route?.traoptimal;
  if (!route || !route.length) return [null, 0];
  const sec = route[0].section || [];
  const sum = route[0].summary || {};
  const cong = sec.length ? sec[sec.length - 1].congestion : null;
  const road = sum.duration ? Math.round((sum.duration / 60000) * 10) / 10 : 0;
  return [cong, road];
}

export default async (req) => {
  const u = new URL(req.url);
  const cat = u.searchParams.get("cat");
  const name = u.searchParams.get("name");
  const category = CATEGORIES[cat];
  if (!category) return json({ error: "unknown category" }, 404);
  const s = category.stores.find((x) => x.name === name);
  if (!s) return json({ error: "unknown store" }, 404);
  const key = `${cat}:${name}`;

  // 0) 도배 방지
  if (rateLimited(clientIP(req))) {
    return json({ error: "rate", message: "잠시 후 다시 시도해 주세요." }, 429);
  }

  // 1) 카테고리별 영업시간 외에는 네이버 호출 안 함 → 비용 0
  if (!isBusinessHoursKST(category.hours)) {
    const zerotime = await zeroTimeToday(cat, name, category.hours[1]);
    return json({ cat, name: s.name, sido: s.sido, addr: s.addr, closed: true,
      hours: category.hours, zerotime, updated: nowKST() });
  }

  // 2) 메모리 캐시(10분)
  const cached = liveCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return json({ ...cached.data, cached: true });
  }

  // 3) 키 없으면 데모
  if (!process.env.NCP_CLIENT_ID) {
    return json(demoOne(cat, s, "no-key"));
  }

  // 4) 실제 조회 (실패 시 이유 담아 데모 폴백)
  try {
    let coord = geoCache.get(key);
    if (!coord) {
      coord = await geocode(s.addr);
      if (coord) geoCache.set(key, coord);
    }
    if (!coord && s.lat != null) coord = [s.lon, s.lat];
    if (!coord) return json(demoOne(cat, s, "no-coord"));

    const [lon, lat] = coord;
    const [cong, road] = await directions(lon, lat);
    if (cong == null) return json(demoOne(cat, s, "no-route"));

    const [label, hex] = CONGESTION[cong] || ["알수없음", "#95a5a6"];
    const queue = QUEUE_EST_MIN[cong] || 0;

    // 관측 기록(요일×시간대 학습) + 제로트래픽 예상 시각 조회 — 실패해도 본 응답엔 영향 없음
    await recordObservation(cat, name, cong);
    const zerotime = await zeroTimeToday(cat, name, category.hours[1]);

    const data = {
      cat, name: s.name, sido: s.sido, addr: s.addr, lat, lon,
      congestion: cong, label, hex,
      road_min: road, queue_min: queue, eta_min: Math.round(road + queue),
      zerotime,
      updated: nowKST(),
    };
    liveCache.set(key, { ts: Date.now(), data });
    return json(data);
  } catch (e) {
    return json(demoOne(cat, s, String(e.message || e)));
  }
};
