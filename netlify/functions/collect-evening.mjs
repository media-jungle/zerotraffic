// [스케줄] 제로트래픽 학습용 저녁 자동 수집 — 코스트코·트레이더스만
// KST 17:00~21:30, 30분 간격 (cron은 UTC 기준: 8:00~12:30)
// 하루 44개 지점 × 10회 = 440 Directions 호출. 수집 종료일 이후엔 아무것도 안 함.
// 종료 후에는 방문자 탭 데이터만으로 계속 학습된다. 연장하려면 COLLECT_END만 수정.
import { CATEGORIES, offsetPoint } from "./_shared.mjs";
import { recordObservation } from "./_stats.mjs";
import { getStore } from "@netlify/blobs";

const COLLECT_END = Date.parse("2026-08-21T00:00:00+09:00"); // 한 달 수집 종료(KST 8/20 자정까지)
const TARGETS = ["costco", "traders"];

const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const DIRECTIONS_URL = "https://maps.apigw.ntruss.com/map-direction/v1/driving";

function hdr() {
  return {
    "x-ncp-apigw-api-key-id": process.env.NCP_CLIENT_ID || "",
    "x-ncp-apigw-api-key": process.env.NCP_CLIENT_SECRET || "",
  };
}
async function geocode(address) {
  const res = await fetch(`${GEOCODE_URL}?query=${encodeURIComponent(address)}`, { headers: hdr() });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d.addresses || !d.addresses.length) return null;
  return [parseFloat(d.addresses[0].x), parseFloat(d.addresses[0].y)];
}
async function congestionAt(lon, lat) {
  const [sLon, sLat] = offsetPoint(lon, lat, 150, 45);
  const url = `${DIRECTIONS_URL}?start=${sLon},${sLat}&goal=${lon},${lat}&option=traoptimal`;
  const res = await fetch(url, { headers: hdr() });
  if (!res.ok) return null;
  const d = await res.json();
  const route = d?.route?.traoptimal;
  if (!route || !route.length) return null;
  const sec = route[0].section || [];
  return sec.length ? sec[sec.length - 1].congestion : null;
}

export default async () => {
  if (Date.now() > COLLECT_END) return new Response("collection period ended");
  if (!process.env.NCP_CLIENT_ID) return new Response("no key");

  let geo = null;
  try { geo = getStore("geo-cache"); } catch { geo = null; }

  const jobs = [];
  for (const cat of TARGETS) {
    for (const s of CATEGORIES[cat].stores) jobs.push({ cat, s });
  }

  let ok = 0, fail = 0;
  // 10개씩 병렬 (함수 시간제한 내 완료)
  for (let i = 0; i < jobs.length; i += 10) {
    await Promise.allSettled(
      jobs.slice(i, i + 10).map(async ({ cat, s }) => {
        try {
          const gKey = `${cat}/${encodeURIComponent(s.name)}`;
          let coord = null;
          if (geo) { try { coord = await geo.get(gKey, { type: "json" }); } catch { coord = null; } }
          if (!coord) {
            coord = await geocode(s.addr);
            if (coord && geo) { try { await geo.setJSON(gKey, coord); } catch { /* 무시 */ } }
          }
          if (!coord && s.lat != null) coord = [s.lon, s.lat];
          if (!coord) { fail++; return; }
          const cong = await congestionAt(coord[0], coord[1]);
          if (cong == null) { fail++; return; }
          await recordObservation(cat, s.name, cong);
          ok++;
        } catch { fail++; }
      })
    );
  }
  return new Response(`collected ok=${ok} fail=${fail}`);
};

// UTC 8:00~12:30 = KST 17:00~21:30, 매 30분
export const config = { schedule: "0,30 8-12 * * *" };
