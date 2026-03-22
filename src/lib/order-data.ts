import type {
  Store,
  MenuCategory,
  MenuItem,
  MenuPrice,
  GelatoPrice,
} from "./order-types";

// ============================================
// 매장 데이터 (17개)
// ============================================
export const stores: Store[] = [
  { id: "s1", name: "청주본점", code: "cheongju", address: "충청북도 청주시 상당구 사직대로 366 1층", phone: "1811-0259", isActive: true, businessHours: "11:00-22:00" },
  { id: "s2", name: "여의도점", code: "yeouido", isActive: true },
  { id: "s3", name: "공덕점", code: "gongdeok", isActive: true },
  { id: "s4", name: "진주혁신점", code: "jinju", isActive: false },
  { id: "s5", name: "봉명점", code: "bongmyeong", isActive: false },
  { id: "s6", name: "성안점", code: "seongan", isActive: false },
  { id: "s7", name: "사창점", code: "sachang", isActive: false },
  { id: "s8", name: "충주점", code: "chungju", isActive: false },
  { id: "s9", name: "완산구점", code: "wansan", isActive: false },
  { id: "s10", name: "팔달구점", code: "paldal", isActive: false },
  { id: "s11", name: "아주대점", code: "ajou", isActive: false },
  { id: "s12", name: "지축점", code: "jichuk", isActive: true },
  { id: "s13", name: "천안점", code: "cheonan", isActive: false },
  { id: "s14", name: "둔산점", code: "dunsan", isActive: false },
  { id: "s15", name: "서구점", code: "seogu", isActive: false },
  { id: "s16", name: "관저점", code: "gwanjeo", isActive: true },
  { id: "s17", name: "선화점", code: "seonhwa", isActive: false },
];

// ============================================
// 메뉴 카테고리 (5개)
// ============================================
export const menuCategories: MenuCategory[] = [
  { id: "cat1", name: "젤라또", sortOrder: 1, isActive: true },
  { id: "cat2", name: "소르베또", sortOrder: 2, isActive: true },
  { id: "cat3", name: "위스키", sortOrder: 3, isActive: true },
  { id: "cat4", name: "와인", sortOrder: 4, isActive: true },
  { id: "cat5", name: "리큐르", sortOrder: 5, isActive: true },
  { id: "cat6", name: "소주", sortOrder: 6, isActive: true },
];

// ============================================
// 젤라또 메뉴 (15종)
// ============================================
export const menuItems: MenuItem[] = [
  // ---- 젤라또 15종 ----
  { id: "g1", categoryId: "cat1", name: "생명쌀", description: "청주 특산물 생명쌀과 바닐라빈이 만나 고소하고 달콤한 맛", badge: "SIGNATURE BEST", isActive: true, sortOrder: 1 },
  { id: "g2", categoryId: "cat1", name: "밀크티", description: "고요하게 퍼지는 홍차 향과 부드러운 우유감이 알콤하게 이어지는 풀에서 밀크티 맛", badge: "NEW", isActive: true, sortOrder: 2 },
  { id: "g3", categoryId: "cat1", name: "쑥", description: "한국의 허브 쑥을 담아 은은한 쌉싸름함과 고소한 풍미가 부드러운 크림과 어우러져 깊은 맛을 내는 젤라또", badge: "NEW", isActive: true, sortOrder: 3 },
  { id: "g4", categoryId: "cat1", name: "오레오", description: "우유 젤라또에 진짜 오레오가 진득 들어간 밀고당기는 환상의 조합인 젤라또", badge: null, isActive: true, sortOrder: 4 },
  { id: "g5", categoryId: "cat1", name: "소금치즈", description: "치즈의 고소함에 소금을 더해 고소함이 배가 되는 젤라또", badge: null, isActive: true, sortOrder: 5 },
  { id: "g6", categoryId: "cat1", name: "누텔라", description: "이탈리의 잼 누텔라에 마스카포네치즈까지 진하고 부드러운 매력의 젤라또", badge: null, isActive: true, sortOrder: 6 },
  { id: "g7", categoryId: "cat1", name: "구운호두", description: "향긋한 메이플시럽에 구운호두를 넣고 졸여 만든 달큼 바삭한 매력의 젤라또", badge: null, isActive: true, sortOrder: 7 },
  { id: "g8", categoryId: "cat1", name: "티라미수", description: "향긋한 커피향이 부드럽게 어우러진 이탈리 전통디저트를 쏙 담은 젤라또", badge: null, isActive: true, sortOrder: 8 },
  { id: "g9", categoryId: "cat1", name: "민트초콜릿칩", description: "색소를 첨가하지 않은 민트에 고급 벨기에 초콜릿칩이 톡톡 박힌 젤라또", badge: null, isActive: true, sortOrder: 9 },
  { id: "g10", categoryId: "cat1", name: "진한 초콜릿", description: "진한 벨기에 초콜릿을 멜팅하여 만든 진짜 깊고 진한 초콜릿 젤라또", badge: null, isActive: true, sortOrder: 10 },
  { id: "g11", categoryId: "cat1", name: "초코녹차", description: "고소한 녹차 젤라또에 가나슈와 그래놀라가 들어가 부드럽고 달콤고소한 젤라또", badge: null, isActive: true, sortOrder: 11 },
  { id: "g12", categoryId: "cat1", name: "딸기치즈케이크", description: "필라델피아 치즈케이크를 듬뿍 넣고 딸기의 달콤함까지 더한 완벽 밸런스 젤라또", badge: null, isActive: true, sortOrder: 12 },
  { id: "g13", categoryId: "cat1", name: "크림치즈블루베리", description: "100% 크림치즈의 찰진 식감과 상큼달달 블루베리잼을 함께 느낄 수 있는 젤라또", badge: null, isActive: true, sortOrder: 13 },
  { id: "g14", categoryId: "cat1", name: "바나나", description: "남녀노소 누구나 좋아하는 하얀색 바나나의 달콤한 맛이 매력인 젤라또", badge: null, isActive: true, sortOrder: 14 },
  { id: "g15", categoryId: "cat1", name: "흑임자", description: "검은깨를 통째로 갈아 넣어 깊이 남아 특하게 고소한 젤라또", badge: null, isActive: true, sortOrder: 15 },

  // ---- 소르베또 5종 ----
  { id: "sb1", categoryId: "cat2", name: "패션후르츠", description: "패션후르츠의 식감과 맛이 생생하게 살아있는 패션후르츠 소르베또", badge: "BEST", isActive: true, sortOrder: 1 },
  { id: "sb2", categoryId: "cat2", name: "레몬", description: "리얼 레몬즙을 넣은 상큼상큼한 레몬 소르베또", badge: "BEST", isActive: true, sortOrder: 2 },
  { id: "sb3", categoryId: "cat2", name: "자몽블랙티", description: "향긋한 블랙티향에 상큼한 자몽알갱이가 톡톡 박히는 매력만점 소르베또", badge: null, isActive: true, sortOrder: 3 },
  { id: "sb4", categoryId: "cat2", name: "토마토", description: "빨갛게 잘 익은 토마토를 감칠맛 가득 넣은 매력 만점 토마토 소르베또", badge: null, isActive: true, sortOrder: 4 },
  { id: "sb5", categoryId: "cat2", name: "귤", description: "상큼한 귤 과즙과 은은한 단맛이 입안에서 톡톡 터지는 산뜻한 소르베또", badge: null, isActive: true, sortOrder: 5 },

  // ---- 위스키 9종 ----
  { id: "w1", categoryId: "cat3", name: "달모어 12y", nameEn: "Dalmore 12y", description: "달모어 12년", badge: "추천", image: "/images/drinks/dalmore-12.webp", isActive: true, sortOrder: 1 },
  { id: "w2", categoryId: "cat3", name: "글렌피딕 12y", nameEn: "Glenfiddich 12y", description: "글렌피딕 12년", badge: null, image: "/images/drinks/glenfiddich-12.webp", isActive: true, sortOrder: 2 },
  { id: "w3", categoryId: "cat3", name: "글렌리벳 12y", nameEn: "Glenlivet 12y", description: "글렌리벳 12년", badge: null, image: "/images/drinks/glenlivet-12.webp", isActive: true, sortOrder: 3 },
  { id: "w4", categoryId: "cat3", name: "글렌드로낙 12y", nameEn: "GlenDronach 12y", description: "글렌드로낙 12년", badge: null, image: "/images/drinks/glendronach.png", isActive: true, sortOrder: 4 },
  { id: "w5", categoryId: "cat3", name: "발베니 12y", nameEn: "Balvenie 12y", description: "발베니 12년", badge: null, image: "/images/drinks/balvenie.png", isActive: true, sortOrder: 5 },
  { id: "w6", categoryId: "cat3", name: "글렌알라키 8y", nameEn: "GlenAllachie 8y", description: "글렌알라키 8년", badge: "NEW", image: "/images/drinks/glenallachie.jpg", isActive: true, sortOrder: 6 },
  { id: "w7", categoryId: "cat3", name: "보모어", nameEn: "Bowmore", description: "보모어", badge: null, image: "/images/drinks/bowmore.png", isActive: true, sortOrder: 7 },
  { id: "w8", categoryId: "cat3", name: "조니워커 블랙", nameEn: "Johnnie Walker Black", description: "조니워커 블랙라벨", badge: null, image: "/images/drinks/johnnie-walker-black.jpg", isActive: true, sortOrder: 8 },
  { id: "w9", categoryId: "cat3", name: "닛카 프롬 더 배럴", nameEn: "Nikka From The Barrel", description: "닛카 위스키 프롬 더 배럴", badge: null, image: "/images/drinks/nikka.png", isActive: true, sortOrder: 9 },

  // ---- 와인 3종 ----
  { id: "wn1", categoryId: "cat4", name: "White 750ml Don Santiago", nameEn: "White Don Santiago", description: "화이트 와인", badge: "추천", image: "/images/drinks/don-santiago-white-hq.jpg", isActive: true, sortOrder: 1 },
  { id: "wn2", categoryId: "cat4", name: "Red 750ml Don Santiago", nameEn: "Red Don Santiago", description: "레드 와인", badge: null, image: "/images/drinks/don-santiago-red.jpg", isActive: true, sortOrder: 2 },
  { id: "wn3", categoryId: "cat4", name: "Rose 750ml", nameEn: "Rose", description: "로제 와인", badge: null, image: "/images/drinks/quevedo-rose.webp", isActive: true, sortOrder: 3 },

  // ---- 리큐르 3종 ----
  { id: "lq1", categoryId: "cat5", name: "서울의 밤", description: "서울의 밤", badge: null, image: "/images/drinks/seoul-night.jpg", isActive: true, sortOrder: 1 },
  { id: "lq2", categoryId: "cat5", name: "도원결의 15도", description: "도원결의 15도", badge: null, image: "/images/drinks/dowon-15.webp", isActive: true, sortOrder: 2 },
  { id: "lq3", categoryId: "cat5", name: "도원결의 21도", description: "도원결의 21도", badge: null, image: "/images/drinks/dowon-21.jpg", isActive: true, sortOrder: 3 },

  // ---- 소주 3종 ----
  { id: "sj1", categoryId: "cat6", name: "새로", description: "롯데 새로 소주", badge: null, image: "/images/drinks/sero-normal.png", isActive: true, sortOrder: 1 },
  { id: "sj2", categoryId: "cat6", name: "가로", description: "롯데 새로 소주 (가로)", badge: null, image: "/images/drinks/sero-garo.png", isActive: true, sortOrder: 2 },
  { id: "sj3", categoryId: "cat6", name: "거꾸로", description: "롯데 새로 소주 (거꾸로)", badge: null, image: "/images/drinks/sero-geokuro.png", isActive: true, sortOrder: 3 },
];

// ============================================
// 젤라또/소르베또 가격 (맛 가지 수 기반)
// ============================================
export const gelatoPrices: GelatoPrice[] = [
  { id: "gp1", optionGroup: "EAT NOW", flavorCount: 1, price: 5000, sortOrder: 1 },
  { id: "gp2", optionGroup: "EAT NOW", flavorCount: 2, price: 6000, sortOrder: 2 },
  { id: "gp3", optionGroup: "TAKE AWAY", flavorCount: 3, price: 15000, sortOrder: 3 },
  { id: "gp4", optionGroup: "TAKE AWAY", flavorCount: 4, price: 20000, sortOrder: 4 },
  { id: "gp5", optionGroup: "TAKE AWAY", flavorCount: 5, price: 28000, sortOrder: 5 },
  { id: "gp6", optionGroup: "TAKE AWAY", flavorCount: 6, price: 38000, sortOrder: 6 },
];

// ============================================
// 주류 가격 옵션
// ============================================
export const menuPrices: MenuPrice[] = [
  // ---- 위스키 (9종 × 2옵션) ----
  { id: "wp1", itemId: "w1", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp2", itemId: "w1", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp3", itemId: "w2", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp4", itemId: "w2", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp5", itemId: "w3", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp6", itemId: "w3", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp7", itemId: "w4", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp8", itemId: "w4", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp9", itemId: "w5", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp10", itemId: "w5", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp11", itemId: "w6", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp12", itemId: "w6", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp13", itemId: "w7", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp14", itemId: "w7", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp15", itemId: "w8", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp16", itemId: "w8", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },
  { id: "wp17", itemId: "w9", optionName: "30ml", price: 9800, sortOrder: 1, isActive: true },
  { id: "wp18", itemId: "w9", optionName: "100ml", price: 19800, sortOrder: 2, isActive: true },

  // ---- 와인 ----
  { id: "wnp1", itemId: "wn1", optionName: "50ml", price: 2900, sortOrder: 1, isActive: true },
  { id: "wnp2", itemId: "wn1", optionName: "bottle", price: 13000, sortOrder: 2, isActive: true },
  { id: "wnp3", itemId: "wn2", optionName: "50ml", price: 2900, sortOrder: 1, isActive: true },
  { id: "wnp4", itemId: "wn2", optionName: "bottle", price: 13000, sortOrder: 2, isActive: true },
  { id: "wnp5", itemId: "wn3", optionName: "50ml", price: 4900, sortOrder: 1, isActive: true },
  { id: "wnp6", itemId: "wn3", optionName: "bottle", price: 15000, sortOrder: 2, isActive: true },

  // ---- 리큐르 ----
  { id: "lqp1", itemId: "lq1", optionName: "bottle", price: 9800, sortOrder: 1, isActive: true },
  { id: "lqp2", itemId: "lq2", optionName: "bottle", price: 9800, sortOrder: 1, isActive: true },
  { id: "lqp3", itemId: "lq3", optionName: "bottle", price: 9800, sortOrder: 1, isActive: true },

  // ---- 소주 ----
  { id: "sjp1", itemId: "sj1", optionName: "bottle", price: 4000, sortOrder: 1, isActive: true },
  { id: "sjp2", itemId: "sj2", optionName: "bottle", price: 4000, sortOrder: 1, isActive: true },
  { id: "sjp3", itemId: "sj3", optionName: "bottle", price: 4000, sortOrder: 1, isActive: true },
];

// ============================================
// 헬퍼 함수
// ============================================
// 전체 주류 상세 설명 (설명 팝업용)
// ============================================
export interface DrinkDescription {
  origin: string;
  type: string;
  abv: string;
  nose: string;
  palate: string;
  finish: string;
  recommend: string;
  gelatoPairingId?: string; // 맛 ID (g1~g15, sb1~sb5)
  gelatoPairing?: string;
}

export const drinkDescriptions: Record<string, DrinkDescription> = {
  // ---- 위스키 9종 ----
  w1: {
    origin: "스코틀랜드 하이랜드", type: "싱글몰트", abv: "40%",
    nose: "오렌지 마말레이드, 시나몬, 초콜릿",
    palate: "셰리 캐스크에서 오는 진한 과일 풍미와 부드러운 바닐라, 시트러스",
    finish: "길고 달콤한 오렌지와 스파이시한 여운",
    recommend: "셰리 캐스크의 진한 과일 풍미를 좋아하시는 분께 추천. 니트 또는 온더락으로 즐기세요.",
    gelatoPairing: "진한 초콜릿 — 셰리의 과일 풍미와 초콜릿의 쓴맛이 환상 조합",
    gelatoPairingId: "g10",
  },
  w2: {
    origin: "스코틀랜드 스페이사이드", type: "싱글몰트", abv: "40%",
    nose: "배, 사과, 은은한 오크 향",
    palate: "가볍고 프루티한 맛, 크림 같은 부드러움, 살짝 달콤한 몰트",
    finish: "깔끔하고 상쾌한 마무리",
    recommend: "위스키 입문자에게 가장 추천! 가볍고 부드러워 누구나 편하게 즐길 수 있어요.",
    gelatoPairing: "바나나 — 가벼운 위스키에 달콤한 바나나가 부드럽게 어울려요",
    gelatoPairingId: "g14",
  },
  w3: {
    origin: "스코틀랜드 스페이사이드", type: "싱글몰트", abv: "40%",
    nose: "꽃향, 바닐라, 신선한 과일",
    palate: "부드럽고 크리미한 열대과일, 꿀, 약간의 아몬드",
    finish: "깔끔하면서 길게 이어지는 바닐라 여운",
    recommend: "부드러운 싱글몰트의 정석. 하이볼로 만들면 상큼하고 청량해요.",
    gelatoPairing: "생명쌀 — 고소한 쌀 젤라또와 바닐라 향이 만나면 고급스러운 디저트",
    gelatoPairingId: "g1",
  },
  w4: {
    origin: "스코틀랜드 하이랜드", type: "싱글몰트", abv: "43%",
    nose: "건포도, 셰리, 다크 초콜릿",
    palate: "묵직한 셰리 풍미, 건과일, 토피, 약간의 스파이스",
    finish: "길고 따뜻한 견과류와 셰리의 여운",
    recommend: "셰리 캐스크 마니아에게 최고. 진하고 묵직한 맛을 원하시면 이걸로!",
    gelatoPairing: "구운호두 — 견과류의 고소함이 셰리 캐스크의 묵직함과 완벽하게 맞아요",
    gelatoPairingId: "g7",
  },
  w5: {
    origin: "스코틀랜드 스페이사이드", type: "싱글몰트", abv: "40%",
    nose: "꿀, 바닐라, 시트러스",
    palate: "꿀과 바닐라의 달콤함, 시나몬, 오크",
    finish: "따뜻하고 부드러운 꿀 여운",
    recommend: "달콤하고 부드러운 위스키의 대명사. 디저트와 함께 즐기면 환상적이에요.",
    gelatoPairing: "밀크티 — 꿀 같은 발베니와 홍차 향 밀크티, 오후의 티타임 느낌",
    gelatoPairingId: "g2",
  },
  w6: {
    origin: "스코틀랜드 스페이사이드", type: "싱글몰트", abv: "46%",
    nose: "헤더 꿀, 오렌지 껍질, 아몬드, 토피",
    palate: "크리미한 허니콤, 레드와인의 달콤함, 오크의 묵직함",
    finish: "진저와 모카의 달콤하고 스파이시한 마무리",
    recommend: "셰리+레드와인 캐스크 숙성으로 달콤하고 묵직해요. 하이볼로도 훌륭!",
    gelatoPairing: "딸기치즈케이크 — 레드와인 캐스크의 과일향과 치즈케이크의 부드러움이 절묘",
    gelatoPairingId: "g12",
  },
  w7: {
    origin: "스코틀랜드 아일라", type: "싱글몰트", abv: "40%",
    nose: "바닷바람, 피트 스모크, 시트러스, 꿀",
    palate: "다크 초콜릿과 피트의 조화, 꿀과 계피의 따뜻함",
    finish: "개운하면서 자몽 같은 산미가 남는 마무리",
    recommend: "스모키한 위스키 입문용으로 딱! 피트향이 부담스럽지 않아 접근하기 좋아요.",
    gelatoPairing: "소금치즈 — 짭짤한 치즈와 스모키한 피트향의 대비가 중독적",
    gelatoPairingId: "g5",
  },
  w8: {
    origin: "스코틀랜드", type: "블렌디드", abv: "40%",
    nose: "다크 프루트, 바닐라, 은은한 스모크",
    palate: "달콤한 바닐라와 강렬한 피트 스모크, 묵직한 타격감",
    finish: "스모키하면서 길게 이어지는 따뜻한 여운",
    recommend: "하이볼의 정석! 탄산수와 섞으면 스모키함이 살아나서 음식과 잘 어울려요.",
    gelatoPairing: "티라미수 — 커피향 젤라또와 스모키한 위스키, 어른의 디저트 조합",
    gelatoPairingId: "g8",
  },
  w9: {
    origin: "일본", type: "블렌디드", abv: "51.4%",
    nose: "오렌지, 매콤한 향신료, 가벼운 이탄 연기",
    palate: "기름진 질감, 견과류, 오크 향신료, 생강의 따뜻함, 빵과 잼 같은 단맛",
    finish: "바닐라와 참나무의 긴 여운, 꿀의 달콤한 마무리",
    recommend: "일본 위스키의 자존심. 도수가 높지만 부드러워요. 니트로 한 모금씩 음미하세요.",
    gelatoPairing: "흑임자 — 깊은 깨 향과 일본 위스키의 섬세한 풍미가 동양적 하모니",
    gelatoPairingId: "g15",
  },
  // ---- 와인 3종 ----
  wn1: {
    origin: "칠레", type: "화이트 와인", abv: "12.5%",
    nose: "청사과, 레몬, 은은한 꽃향기",
    palate: "상큼한 시트러스와 청량한 산미, 가벼운 미네랄",
    finish: "깔끔하고 드라이한 마무리",
    recommend: "가볍고 상큼한 와인을 원하시면 이걸로. 젤라또와 함께 가볍게 즐기기 좋아요.",
    gelatoPairing: "레몬 소르베또 — 상큼한 화이트 와인과 레몬의 시트러스 향이 청량 폭발",
    gelatoPairingId: "sb2",
  },
  wn2: {
    origin: "칠레", type: "레드 와인", abv: "13%",
    nose: "체리, 자두, 은은한 오크",
    palate: "부드러운 타닌감, 잘 익은 베리의 달콤함, 약간의 스파이스",
    finish: "따뜻하고 부드러운 베리 여운",
    recommend: "부담 없는 레드 와인. 치즈 젤라또와 곁들이면 와인바 분위기!",
    gelatoPairing: "크림치즈블루베리 — 레드 와인의 베리향과 블루베리 젤라또가 완벽 매칭",
    gelatoPairingId: "g13",
  },
  wn3: {
    origin: "유럽", type: "로제 와인", abv: "12%",
    nose: "딸기, 장미, 수박 향",
    palate: "산뜻한 딸기와 시트러스, 가벼운 단맛",
    finish: "상큼하고 화사한 마무리",
    recommend: "와인 입문자에게 딱! 달콤하면서 가벼워 누구나 부담 없이 즐겨요.",
    gelatoPairing: "패션후르츠 소르베또 — 로제의 화사함과 열대과일의 상큼함이 여름 느낌",
    gelatoPairingId: "sb1",
  },
  // ---- 리큐르 3종 ----
  lq1: {
    origin: "한국", type: "리큐르", abv: "15%",
    nose: "밤, 은은한 곡물 향, 달콤한 캐러멜",
    palate: "밤의 고소함과 자연스러운 단맛, 부드러운 질감",
    finish: "따뜻하고 포근한 견과류 여운",
    recommend: "이름처럼 서울의 밤거리를 떠올리게 하는 달콤한 리큐르. 얼음 넣어서 천천히 즐기세요.",
    gelatoPairing: "생명쌀 — 고소한 쌀 젤라또에 밤 리큐르를 살짝 끼얹으면 한국식 아포가토",
    gelatoPairingId: "g1",
  },
  lq2: {
    origin: "한국", type: "리큐르", abv: "15%",
    nose: "복숭아, 매실, 은은한 허브",
    palate: "과일의 상큼함과 부드러운 단맛, 가벼운 바디",
    finish: "깔끔하고 상큼한 마무리",
    recommend: "도수가 낮아 부담 없어요. 식전주나 디저트와 함께 가볍게 즐기기 좋습니다.",
    gelatoPairing: "귤 소르베또 — 상큼한 과일 리큐르와 귤 소르베또의 산뜻한 페어링",
    gelatoPairingId: "sb5",
  },
  lq3: {
    origin: "한국", type: "리큐르", abv: "21%",
    nose: "잘 익은 과실, 달콤한 허브, 약간의 알코올",
    palate: "15도보다 묵직하고 진한 과일 풍미, 따뜻한 스파이스",
    finish: "길게 이어지는 과일과 허브의 여운",
    recommend: "15도보다 한층 깊은 맛. 좀 더 진한 리큐르를 원하시면 21도를 추천합니다.",
    gelatoPairing: "쑥 — 허브 향의 쑥 젤라또와 도원결의 허브 풍미가 묘하게 잘 맞아요",
    gelatoPairingId: "g3",
  },
};

export function getDrinkDescription(itemId: string): DrinkDescription | null {
  return drinkDescriptions[itemId] || null;
}

// 하위 호환성
export function getWhiskyDescription(itemId: string): DrinkDescription | null {
  return drinkDescriptions[itemId] || null;
}

// ============================================
export function getStoreByCode(code: string): Store | undefined {
  return stores.find((s) => s.code === code);
}

export function getActiveStores(): Store[] {
  return stores.filter((s) => s.isActive);
}

export function getItemsByCategory(categoryId: string): MenuItem[] {
  return menuItems
    .filter((m) => m.categoryId === categoryId && m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPricesForItem(itemId: string): MenuPrice[] {
  return menuPrices
    .filter((p) => p.itemId === itemId && p.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getGelatoPricesByGroup(group: "EAT NOW" | "TAKE AWAY"): GelatoPrice[] {
  return gelatoPrices
    .filter((p) => p.optionGroup === group)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 젤라또 + 소르베또 통합 목록 (맛 선택용) */
export function getAllFlavors(): MenuItem[] {
  return menuItems
    .filter((m) => (m.categoryId === "cat1" || m.categoryId === "cat2") && m.isActive)
    .sort((a, b) => {
      if (a.categoryId !== b.categoryId) return a.categoryId < b.categoryId ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
}

/** 금액 포맷 (원화) */
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

/** 카테고리가 주류인지 확인 */
export function isAlcoholCategory(categoryId: string): boolean {
  return categoryId === "cat3" || categoryId === "cat4" || categoryId === "cat5";
}
