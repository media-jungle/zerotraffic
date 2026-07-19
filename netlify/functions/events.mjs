// 전시장 오늘 행사 조회 — 한국관광공사 TourAPI (외부 의존성 없음)
// GET /.netlify/functions/events?venue=킨텍스|코엑스|벡스코
//
// 사용 API: 한국관광공사_국문 관광정보 서비스_GW (data.go.kr/data/15101578)
//  - 행사정보조회: KorService2/searchFestival2 (구버전 KorService1/searchFestival1 폴백)
//  - 같은 공공데이터포털 인증키(DATA_GO_KR_KEY) 사용
// 행사 일정은 자주 안 바뀌므로 6시간 캐시.
import { nowKST } from "./_shared.mjs";

const CACHE_MS = 6 * 60 * 60 * 1000; // 6시간
const cache = new Map(); // venue -> {ts, data}

// venue별 지역코드 + 주소/제목 매칭 키워드
const VENUES = {
  "킨텍스": { areaCode: "31", keywords: ["킨텍스", "kintex"] },
  "코엑스": { areaCode: "1",  keywords: ["코엑스", "coex", "영동대로 513", "삼성동 159"] },
  "벡스코": { areaCode: "6",  keywords: ["벡스코", "bexco", "apec로 55"] },
};

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

function kstYMD(offsetDays = 0) {
  const d = new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

async function fetchFestivals(key, areaCode) {
  const startFrom = kstYMD(-120); // 120일 전 시작한 장기 전시까지 포함
  const common = `serviceKey=${encodeURIComponent(key)}&MobileOS=ETC&MobileApp=zerotraffic&_type=json&listYN=Y&arrange=C&numOfRows=300&pageNo=1&eventStartDate=${startFrom}&areaCode=${areaCode}`;
  const urls = [
    `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${common}`,
    `https://apis.data.go.kr/B551011/KorService1/searchFestival1?${common}`,
  ];
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) { lastErr = new Error("http " + res.status); continue; }
      const d = await res.json();
      const items = d?.response?.body?.items;
      if (items === "" || items == null) return []; // 결과 0건
      return [].concat(items.item || []);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("festival fetch failed");
}

export default async (req) => {
  const venue = new URL(req.url).searchParams.get("venue");
  const v = VENUES[venue];
  if (!v) return json({ error: "unknown venue" }, 404);

  if (rateLimited(clientIP(req))) {
    return json({ error: "rate", message: "잠시 후 다시 시도해 주세요." }, 429);
  }

  const cached = cache.get(venue);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return json({ ...cached.data, cached: true });
  }

  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return json({ venue, count: null, demo: true, reason: "no-key", updated: nowKST() });

  try {
    const items = await fetchFestivals(key, v.areaCode);
    const today = kstYMD(0);
    const ongoing = items.filter((it) => {
      const hay = `${it.title || ""} ${it.addr1 || ""} ${it.addr2 || ""}`.toLowerCase();
      if (!v.keywords.some((k) => hay.includes(k.toLowerCase()))) return false;
      const s = String(it.eventstartdate || "");
      const e = String(it.eventenddate || "");
      return s && e && s <= today && today <= e;
    });
    const data = {
      venue,
      count: ongoing.length,
      events: ongoing.slice(0, 5).map((it) => ({
        title: it.title,
        end: String(it.eventenddate || ""),
      })),
      updated: nowKST(),
    };
    cache.set(venue, { ts: Date.now(), data });
    return json(data);
  } catch (e) {
    return json({ venue, count: null, demo: true, reason: String(e.message || e), updated: nowKST() });
  }
};
