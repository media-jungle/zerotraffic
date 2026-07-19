// 공용 상수·헬퍼 — 제로트래픽 통합판
// 카테고리별 장소 목록. 좌표는 네이버 지오코딩이 자동 계산(없으면 approx 폴백).

export const CATEGORIES = {
  costco: {
    label: "코스트코", emoji: "🛒", hours: [10, 22],
    stores: [
      { name: "양평점", sido: "서울", addr: "서울특별시 영등포구 선유로 156", lat: 37.5375, lon: 126.8965 },
      { name: "양재점", sido: "서울", addr: "서울특별시 서초구 양재대로 159", lat: 37.4699, lon: 127.0389 },
      { name: "상봉점", sido: "서울", addr: "서울특별시 중랑구 망우로 336", lat: 37.5967, lon: 127.0876 },
      { name: "고척점", sido: "서울", addr: "서울특별시 구로구 경인로43길 49", lat: 37.5006, lon: 126.8570 },
      { name: "부산점", sido: "부산", addr: "부산광역시 수영구 구락로 137", lat: 35.1770, lon: 129.1130 },
      { name: "송도점", sido: "인천", addr: "인천광역시 연수구 컨벤시아대로230번길 60", lat: 37.3894, lon: 126.6390 },
      { name: "청라점", sido: "인천", addr: "인천광역시 서구 첨단서로 188", lat: 37.5360, lon: 126.6420 },
      { name: "대구점", sido: "대구", addr: "대구광역시 북구 검단로 97", lat: 35.9010, lon: 128.6010 },
      { name: "대구혁신도시점", sido: "대구", addr: "대구광역시 동구 첨단로 10", lat: 35.8730, lon: 128.7250 },
      { name: "대전점", sido: "대전", addr: "대전광역시 중구 오류로 41", lat: 36.3320, lon: 127.4030 },
      { name: "울산점", sido: "울산", addr: "울산광역시 북구 진장유통로 78-12", lat: 35.5720, lon: 129.3610 },
      { name: "세종점", sido: "세종", addr: "세종특별자치시 종합운동장1로 14", lat: 36.4870, lon: 127.2560 },
      { name: "일산점", sido: "경기", addr: "경기도 고양시 일산동구 장백로 25", lat: 37.6480, lon: 126.7920 },
      { name: "광명점", sido: "경기", addr: "경기도 광명시 일직로 40", lat: 37.4160, lon: 126.8840 },
      { name: "의정부점", sido: "경기", addr: "경기도 의정부시 용민로489번길 9", lat: 37.7580, lon: 127.0870 },
      { name: "공세점(용인)", sido: "경기", addr: "경기도 용인시 기흥구 탑실로 38", lat: 37.2360, lon: 127.1160 },
      { name: "하남점", sido: "경기", addr: "경기도 하남시 미사강변중앙로 40", lat: 37.5620, lon: 127.1930 },
      { name: "평택점", sido: "경기", addr: "경기도 평택시 경기대로 975", lat: 36.9970, lon: 127.1010 },
      { name: "천안점", sido: "충남", addr: "충청남도 천안시 서북구 3공단6로 77", lat: 36.8320, lon: 127.1030 },
      { name: "김해점", sido: "경남", addr: "경상남도 김해시 주촌면 선천남로 16", lat: 35.2280, lon: 128.8100 },
    ],
  },
  traders: {
    label: "트레이더스", emoji: "📦", hours: [10, 22],
    stores: [
      { name: "구성점", sido: "경기", addr: "경기도 용인시 기흥구 용구대로 2457", lat: 37.2750, lon: 127.1150 },
      { name: "송림점", sido: "인천", addr: "인천광역시 동구 봉수대로 82", lat: 37.4780, lon: 126.6330 },
      { name: "안산점", sido: "경기", addr: "경기도 안산시 단원구 중앙대로 397", lat: 37.3190, lon: 126.8300 },
      { name: "수원점", sido: "경기", addr: "경기도 수원시 영통구 삼성로 2", lat: 37.2590, lon: 127.0490 },
      { name: "일산점", sido: "경기", addr: "경기도 고양시 일산서구 킨텍스로 171", lat: 37.6690, lon: 126.7440 },
      { name: "하남점", sido: "경기", addr: "경기도 하남시 미사대로 750", lat: 37.5600, lon: 127.1940 },
      { name: "고양점", sido: "경기", addr: "경기도 고양시 덕양구 고양대로 1955", lat: 37.6380, lon: 126.8340 },
      { name: "군포점", sido: "경기", addr: "경기도 군포시 삼성로 74", lat: 37.3610, lon: 126.9350 },
      { name: "김포점", sido: "경기", addr: "경기도 김포시 김포대로 715", lat: 37.6150, lon: 126.7150 },
      { name: "위례점", sido: "경기", addr: "경기도 하남시 위례대로 200", lat: 37.4690, lon: 127.1520 },
      { name: "월계점", sido: "서울", addr: "서울특별시 노원구 마들로3길 17", lat: 37.6270, lon: 127.0570 },
      { name: "부천점", sido: "경기", addr: "경기도 부천시 소사구 옥길동 768", lat: 37.4630, lon: 126.8120 },
      { name: "안성점", sido: "경기", addr: "경기도 안성시 공도읍 서동대로 3930-39", lat: 37.0990, lon: 127.1530 },
      { name: "동탄점", sido: "경기", addr: "경기도 화성시 동탄대로 451", lat: 37.2000, lon: 127.0750 },
      { name: "수원화서점", sido: "경기", addr: "경기도 수원시 장안구 수성로 175", lat: 37.2940, lon: 126.9990 },
      { name: "마곡점", sido: "서울", addr: "서울특별시 강서구 마곡동 769", lat: 37.5600, lon: 126.8250 },
      { name: "구월점", sido: "인천", addr: "인천광역시 남동구 매소홀로 759", lat: 37.4470, lon: 126.7050 },
      { name: "월평점", sido: "대전", addr: "대전광역시 서구 한밭대로 580", lat: 36.3570, lon: 127.3650 },
      { name: "천안아산점", sido: "충남", addr: "충청남도 아산시 배방읍 고속철대로 133", lat: 36.7950, lon: 127.1040 },
      { name: "서면점", sido: "부산", addr: "부산광역시 부산진구 시민공원로 31", lat: 35.1630, lon: 129.0530 },
      { name: "비산점", sido: "대구", addr: "대구광역시 서구 팔달로 54", lat: 35.8780, lon: 128.5560 },
      { name: "양산점", sido: "경남", addr: "경상남도 양산시 평산로 16", lat: 35.3380, lon: 129.0230 },
      { name: "명지점", sido: "부산", addr: "부산광역시 강서구 명지국제6로 168", lat: 35.0970, lon: 128.9120 },
      { name: "연산점", sido: "부산", addr: "부산광역시 연제구 좌수영로 241", lat: 35.1760, lon: 129.0830 },
    ],
  },
  outlet: {
    label: "아울렛", emoji: "🛍️", hours: [10, 21],
    stores: [
      { name: "현대 김포", sido: "경기", addr: "경기도 김포시 고촌읍 아라육로152번길 100", lat: 37.5890, lon: 126.7220 },
      { name: "현대 송도", sido: "인천", addr: "인천광역시 연수구 송도국제대로 123", lat: 37.3850, lon: 126.6410 },
      { name: "현대 스페이스원", sido: "경기", addr: "경기도 남양주시 다산순환로 50", lat: 37.6120, lon: 127.1520 },
      { name: "신세계 여주", sido: "경기", addr: "경기도 여주시 명품로 360", lat: 37.2670, lon: 127.6220 },
      { name: "신세계 파주", sido: "경기", addr: "경기도 파주시 탄현면 필승로 200", lat: 37.7570, lon: 126.6910 },
      { name: "신세계 시흥", sido: "경기", addr: "경기도 시흥시 서해안로 699", lat: 37.3510, lon: 126.7350 },
      { name: "롯데 기흥", sido: "경기", addr: "경기도 용인시 기흥구 신고매로 124", lat: 37.2180, lon: 127.1080 },
      { name: "타임빌라스 의왕", sido: "경기", addr: "경기도 의왕시 바라산로 1", lat: 37.3690, lon: 127.0180 },
      { name: "롯데 동부산", sido: "부산", addr: "부산광역시 기장군 기장읍 기장해안로 147", lat: 35.1930, lon: 129.2130 },
    ],
  },
  starfield: {
    label: "스타필드", emoji: "🏬", hours: [10, 22],
    stores: [
      { name: "하남", sido: "경기", addr: "경기도 하남시 미사대로 750", lat: 37.5600, lon: 127.1940 },
      { name: "고양", sido: "경기", addr: "경기도 고양시 덕양구 고양대로 1955", lat: 37.6380, lon: 126.8340 },
      { name: "수원", sido: "경기", addr: "경기도 수원시 장안구 수성로 175", lat: 37.2940, lon: 126.9990 },
      { name: "안성", sido: "경기", addr: "경기도 안성시 공도읍 서동대로 3930-39", lat: 37.0990, lon: 127.1530 },
      { name: "시티 위례", sido: "경기", addr: "경기도 하남시 위례대로 200", lat: 37.4690, lon: 127.1520 },
      { name: "시티 부천", sido: "경기", addr: "경기도 부천시 소사구 옥길동 768", lat: 37.4630, lon: 126.8120 },
    ],
  },
  ikea: {
    label: "이케아", emoji: "🛋️", hours: [10, 22],
    stores: [
      { name: "광명점", sido: "경기", addr: "경기도 광명시 일직로 17", lat: 37.4230, lon: 126.8830 },
      { name: "고양점", sido: "경기", addr: "경기도 고양시 덕양구 권율대로 420", lat: 37.6520, lon: 126.8930 },
      { name: "기흥점", sido: "경기", addr: "경기도 용인시 기흥구 신고매로 62", lat: 37.2200, lon: 127.1060 },
      { name: "동부산점", sido: "부산", addr: "부산광역시 기장군 기장읍 동부산관광3로 17", lat: 35.1930, lon: 129.2100 },
    ],
  },
  themepark: {
    label: "에버랜드·롯데월드", emoji: "🎢", hours: [9, 22],
    stores: [
      { name: "에버랜드", sido: "경기", addr: "경기도 용인시 처인구 포곡읍 에버랜드로 199", lat: 37.2940, lon: 127.2020 },
      { name: "롯데월드", sido: "서울", addr: "서울특별시 송파구 올림픽로 240", lat: 37.5110, lon: 127.0980 },
    ],
  },
  department: {
    label: "백화점·복합몰", emoji: "🏢", hours: [10, 21],
    stores: [
      { name: "더현대서울", sido: "서울", addr: "서울특별시 영등포구 여의대로 108", lat: 37.5260, lon: 126.9280 },
      { name: "롯데월드몰·타워", sido: "서울", addr: "서울특별시 송파구 올림픽로 300", lat: 37.5130, lon: 127.1040 },
      { name: "신세계 강남", sido: "서울", addr: "서울특별시 서초구 신반포로 176", lat: 37.5050, lon: 127.0040 },
      { name: "현대 판교", sido: "경기", addr: "경기도 성남시 분당구 판교역로146번길 20", lat: 37.3930, lon: 127.1120 },
      { name: "롯데몰 김포공항", sido: "서울", addr: "서울특별시 강서구 하늘길 77", lat: 37.5630, lon: 126.8040 },
      { name: "신세계 센텀시티", sido: "부산", addr: "부산광역시 해운대구 센텀남대로 35", lat: 35.1690, lon: 129.1290 },
    ],
  },
  expo: {
    label: "전시장", emoji: "🎪", hours: [9, 20],
    stores: [
      { name: "킨텍스", sido: "경기", addr: "경기도 고양시 일산서구 킨텍스로 217-60", lat: 37.6680, lon: 126.7450 },
      { name: "코엑스", sido: "서울", addr: "서울특별시 강남구 영동대로 513", lat: 37.5120, lon: 127.0590 },
      { name: "벡스코", sido: "부산", addr: "부산광역시 해운대구 APEC로 55", lat: 35.1690, lon: 129.1360 },
    ],
  },
  stadium: {
    label: "야구장", emoji: "⚾", hours: [12, 23],
    stores: [
      { name: "잠실야구장", sido: "서울", addr: "서울특별시 송파구 올림픽로 25", lat: 37.5120, lon: 127.0720 },
      { name: "고척스카이돔", sido: "서울", addr: "서울특별시 구로구 경인로 430", lat: 37.4980, lon: 126.8670 },
      { name: "랜더스필드", sido: "인천", addr: "인천광역시 미추홀구 매소홀로 618", lat: 37.4370, lon: 126.6930 },
    ],
  },
  waterpark: {
    label: "워터파크", emoji: "💦", hours: [9, 20],
    stores: [
      { name: "캐리비안베이", sido: "경기", addr: "경기도 용인시 처인구 포곡읍 에버랜드로 199", lat: 37.2940, lon: 127.2020 },
      { name: "오션월드", sido: "강원", addr: "강원특별자치도 홍천군 서면 한치골길 262", lat: 37.6480, lon: 127.6870 },
      { name: "롯데워터파크", sido: "경남", addr: "경상남도 김해시 장유로 555", lat: 35.1950, lon: 128.8080 },
    ],
  },
  hospital: {
    label: "대형병원", emoji: "🏥", hours: [8, 20],
    stores: [
      { name: "서울아산병원", sido: "서울", addr: "서울특별시 송파구 올림픽로43길 88", lat: 37.5270, lon: 127.1080 },
      { name: "삼성서울병원", sido: "서울", addr: "서울특별시 강남구 일원로 81", lat: 37.4880, lon: 127.0850 },
      { name: "신촌세브란스", sido: "서울", addr: "서울특별시 서대문구 연세로 50-1", lat: 37.5620, lon: 126.9400 },
      { name: "서울성모병원", sido: "서울", addr: "서울특별시 서초구 반포대로 222", lat: 37.5010, lon: 127.0050 },
      { name: "분당서울대병원", sido: "경기", addr: "경기도 성남시 분당구 구미로173번길 82", lat: 37.3520, lon: 127.1240 },
    ],
  },
};

// 공항 — 주차장 층/구역별 잔여 대수는 공공데이터 API(airport.mjs)로 조회.
// src: "icn" = 인천국제공항공사 API, "kac" = 한국공항공사 API(airportCode 사용)
export const AIRPORTS = [
  { code: "ICN1", name: "인천공항 T1", src: "icn", filter: "T1", addr: "인천광역시 중구 공항로 272", lat: 37.4490, lon: 126.4510 },
  { code: "ICN2", name: "인천공항 T2", src: "icn", filter: "T2", addr: "인천광역시 중구 제2터미널대로 446", lat: 37.4680, lon: 126.4340 },
  { code: "GMP", name: "김포공항", src: "kac", airportCode: "GMP", addr: "서울특별시 강서구 하늘길 76", lat: 37.5590, lon: 126.7940 },
  { code: "CJU", name: "제주공항", src: "kac", airportCode: "CJU", addr: "제주특별자치도 제주시 공항로 2", lat: 33.5070, lon: 126.4930 },
  { code: "PUS", name: "김해공항", src: "kac", airportCode: "PUS", addr: "부산광역시 강서구 공항진입로 108", lat: 35.1700, lon: 128.9450 },
];

// 네이버 congestion 코드(0~3) → [라벨, HEX]
// 0: 정보없음(한산으로 간주) · 1: 원활 · 2: 서행 · 3: 정체
export const CONGESTION = {
  0: ["원활", "#2ecc71"], 1: ["원활", "#2ecc71"],
  2: ["서행", "#f1c40f"], 3: ["정체", "#e74c3c"],
};

// 혼잡도별 주차 진입 대기(분) 추정치
export const QUEUE_EST_MIN = { 0: 1, 1: 1, 2: 7, 3: 15 };

// 정문 좌표에서 meters/bearing 만큼 떨어진 진입 출발점 [lon, lat]
export function offsetPoint(lon, lat, meters = 150, bearingDeg = 45) {
  const R = 6378137.0;
  const br = (bearingDeg * Math.PI) / 180;
  const dLat = (meters * Math.cos(br)) / R;
  const dLon = (meters * Math.sin(br)) / (R * Math.cos((lat * Math.PI) / 180));
  return [lon + (dLon * 180) / Math.PI, lat + (dLat * 180) / Math.PI];
}

// 한국 시간(KST) 기준 카테고리 영업시간 여부
export function isBusinessHoursKST(hours = [10, 22]) {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  const h = kst.getUTCHours();
  return h >= hours[0] && h < hours[1];
}

// 한국 시간 문자열
export function nowKST() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return kst.toISOString().replace("T", " ").slice(0, 19);
}
