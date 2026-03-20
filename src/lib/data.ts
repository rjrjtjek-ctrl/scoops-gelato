// 메뉴 데이터 — 실제 스쿱스 젤라떼리아 메뉴
export type MenuCategory = "Gelato" | "Sorbetto" | "Coffee" | "Whiskey" | "Wine";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: MenuCategory;
  isSignature?: boolean;
  price?: string;
  image?: string; // 이미지 경로 — 추후 추가
}

export const menuItems: MenuItem[] = [
  // Gelato
  { id: 1, name: "갓지은쌀", description: "갓 지은 쌀의 고소하고 부드러운 풍미를 그대로 담았습니다", category: "Gelato", isSignature: true },
  { id: 2, name: "벨기에 다크 카카오", description: "벨기에산 다크 카카오의 깊고 진한 초콜릿 풍미", category: "Gelato", isSignature: true },
  { id: 3, name: "밀라노티라미수", description: "이탈리아 밀라노 스타일의 클래식 티라미수 젤라또", category: "Gelato", isSignature: true },
  { id: 4, name: "피에몬테 누텔라", description: "피에몬테산 헤이즐넛과 누텔라의 달콤한 조화", category: "Gelato" },
  { id: 5, name: "구운호두", description: "직접 구운 호두의 고소하고 따뜻한 너티 풍미", category: "Gelato" },
  { id: 6, name: "뉴욕쿠키크림", description: "뉴욕 스타일 쿠키와 부드러운 크림의 만남", category: "Gelato" },
  { id: 7, name: "브레맨 크림솔트", description: "달콤 짭짤한 크림솔트의 중독적인 맛", category: "Gelato" },
  { id: 8, name: "민트초코", description: "상쾌한 민트와 초콜릿 칩의 클래식한 조합", category: "Gelato" },
  { id: 9, name: "뉴욕딸기치즈케이크", description: "뉴욕 치즈케이크에 생딸기를 더한 특별한 맛", category: "Gelato" },
  { id: 10, name: "블루베리 크림치즈", description: "새콤한 블루베리와 부드러운 크림치즈의 조화", category: "Gelato" },
  { id: 11, name: "필리핀 바나나우유", description: "필리핀산 바나나로 만든 달콤한 바나나우유 맛", category: "Gelato" },
  { id: 12, name: "고소한 흑임자", description: "국산 흑임자의 깊고 고소한 전통의 맛", category: "Gelato" },
  { id: 13, name: "카카오 말차", description: "카카오와 말차가 만나 만들어낸 독특한 풍미", category: "Gelato" },
  { id: 14, name: "거친쑥", description: "향긋한 쑥의 자연스러운 풍미를 살린 젤라또", category: "Gelato" },
  { id: 15, name: "밀크티", description: "진한 홍차와 부드러운 밀크의 완벽한 밸런스", category: "Gelato" },
  // Sorbetto
  { id: 16, name: "럼동성 패션후르츠", description: "열대 패션후르츠에 럼의 풍미를 더한 시그니처 소르베또", category: "Sorbetto", isSignature: true },
  { id: 17, name: "아말피 레몬", description: "이탈리아 아말피 해안의 상큼한 레몬 소르베또", category: "Sorbetto" },
  { id: 18, name: "홍콩자몽티", description: "홍콩 스타일 자몽티의 달콤 쌉쌀한 청량감", category: "Sorbetto" },
  { id: 19, name: "시칠리아토마토", description: "시칠리아 태양 아래 자란 토마토의 상큼함", category: "Sorbetto" },
  { id: 20, name: "제철과일", description: "매 시즌 엄선한 제철 과일로 만드는 한정 소르베또", category: "Sorbetto" },
  // Coffee
  { id: 21, name: "아메리카노", description: "깊고 진한 에스프레소 베이스의 클래식 아메리카노", category: "Coffee", price: "4,000원" },
  { id: 22, name: "아포가토", description: "진한 에스프레소와 젤라또의 환상적인 만남", category: "Coffee", price: "5,500원" },
  // Whiskey — 기본 라인업 (매장마다 다양한 위스키를 추가 운영)
  { id: 23, name: "발베니 더블우드 12년", description: "아메리칸 오크와 셰리 캐스크에서 숙성된 꿀, 바닐라, 시나몬의 부드러운 풍미", category: "Whiskey", isSignature: true },
  { id: 24, name: "글랜피딕 12년", description: "싱글몰트 위스키의 클래식. 배, 크리미한 버터스카치의 우아한 밸런스", category: "Whiskey", isSignature: true },
  { id: 25, name: "달모어 12년", description: "오렌지 마멀레이드와 초콜릿, 스파이시한 피니시가 돋보이는 하이랜드 싱글몰트", category: "Whiskey", isSignature: true },
  { id: 26, name: "매장별 셀렉션", description: "각 매장의 바텐더가 직접 선별한 다양한 위스키를 만나보세요", category: "Whiskey" },
  // Wine
  { id: 28, name: "하우스 레드 와인", description: "과일 향이 풍부한 미디엄 바디의 레드 와인", category: "Wine" },
  { id: 29, name: "하우스 화이트 와인", description: "상큼하고 가벼운 시트러스 노트의 화이트 와인", category: "Wine" },
  { id: 30, name: "스파클링 와인", description: "청량한 기포와 과일향이 어우러진 스파클링", category: "Wine" },
];

// 가격 정보
export const priceInfo = {
  eatNow: [
    { label: "1가지맛", price: "5,000원" },
    { label: "2가지맛", price: "6,000원" },
  ],
  takeAway: [
    { label: "3가지맛", price: "15,000원" },
    { label: "4가지맛", price: "20,000원" },
    { label: "5가지맛", price: "28,000원" },
    { label: "6가지맛", price: "38,000원" },
  ],
};

// 매장 데이터 — 전체 매장 (운영중 + 폐업 포함)
export interface Store {
  id: number;
  name: string;
  isClosed?: boolean;
  image?: string; // TODO: 매장 사진 추가 → /images/store-[이름].jpg
}

export const stores: Store[] = [
  { id: 1, name: "스쿱스젤라또 청주본점", image: "/images/store-chungbuk-ext.jpg" },
  { id: 2, name: "스쿱스젤라또 여의도점", image: "/images/store-yeouido-ext.jpg" },
  { id: 3, name: "스쿱스젤라또 공덕점", image: "/images/store-gongdeok-ext.jpg" },
  { id: 4, name: "스쿱스젤라또 진주혁신점", isClosed: true, image: "/images/store-jinju-int.jpeg" },
  { id: 5, name: "스쿱스젤라또 봉명점", isClosed: true, image: "/images/store-bongmyeong-ext.jpeg" },
  { id: 6, name: "스쿱스젤라또 성안점", isClosed: true, image: "/images/store-seongan-ext.png" },
  { id: 7, name: "스쿱스젤라또 사창점", isClosed: true, image: "/images/store-chungbuk-ext-old.jpg" },
  { id: 8, name: "스쿱스젤라또 충주점", isClosed: true, image: "/images/store-chungju-ext.jpeg" },
  { id: 9, name: "스쿱스젤라또 완산구점", isClosed: true, image: "/images/store-wansan-ext.png" },
  { id: 10, name: "스쿱스젤라또 팔달구점", isClosed: true, image: "/images/store-paldal-ext.jpeg" },
  { id: 11, name: "스쿱스젤라또 아주대점", isClosed: true, image: "/images/store-ajou-ext.jpeg" },
  { id: 12, name: "스쿱스젤라또 지축점", image: "/images/store-jichuk-ext.jpeg" },
  { id: 13, name: "스쿱스젤라또 천안점", isClosed: true, image: "/images/store-cheonan-ext.jpeg" },
  { id: 14, name: "스쿱스젤라또 둔산점", isClosed: true, image: "/images/store-dunsan-ext.jpeg" },
  { id: 15, name: "스쿱스젤라또 서구점", isClosed: true, image: "/images/store-seoku-ext.jpeg" },
  { id: 16, name: "스쿱스젤라또 관저점", image: "/images/store-gwanjeo-int.jpeg" },
  { id: 17, name: "스쿱스젤라또 선화점", isClosed: true, image: "/images/store-seonhwa-ext.jpeg" },
];

// 브랜드 타임라인
export interface TimelineEvent { year: string; title: string; description: string; }

export const timeline: TimelineEvent[] = [
  { year: "2018", title: "스쿱스 젤라떼리아 탄생", description: "젤라또를 좋아하는 남매가 이곳저곳 돌아다니며 맛보고 공부하며 충북 청주 봉명동에서 첫 매장을 오픈했습니다." },
  { year: "2019", title: "시그니처 레시피 완성", description: "청원생명쌀 젤라또, 밀라노티라미수 등 한국 재료와 이탈리안 정통 방식을 결합한 시그니처 레시피를 완성했습니다." },
  { year: "2020", title: "프랜차이즈 사업 시작", description: "검증된 맛과 운영 시스템을 바탕으로 가맹 사업을 시작, 전국 확장의 첫걸음을 내디뎠습니다." },
  { year: "2022", title: "전국 다점포 확장", description: "청주, 대전, 서울 여의도, 고양, 진주 등 전국 주요 상권으로 매장을 확장했습니다." },
  { year: "2024", title: "프리미엄 브랜드 도약", description: "\"경험을 파는 브랜드\"로 리브랜딩. 청주시 학교급식 지역특산 젤라또 공급 등 지역사회 기여에도 앞장서고 있습니다." },
];

// 고객 후기
export interface Review {
  id: number;
  text: string;
  author: string;
  store: string;
}

export const reviews: Review[] = [
  { id: 1, text: "여기 젤라또 먹으면 다른 데 못 가요. 갓지은쌀 맛은 정말 독보적이에요.", author: "김**", store: "청주 본점" },
  { id: 2, text: "이탈리아에서 먹었던 젤라또가 생각나는 맛. 매장 분위기도 너무 좋아요.", author: "이**", store: "여의도점" },
  { id: 3, text: "아이들이 너무 좋아해서 매주 와요. 재료가 좋아서 안심하고 먹일 수 있어요.", author: "박**", store: "대전중구점" },
];

// 가맹 문의 지역 옵션
export const regionOptions = ["서울", "경기/인천", "충청/대전", "부산/경남", "대구/경북", "광주/전라", "강원", "제주", "기타"];
