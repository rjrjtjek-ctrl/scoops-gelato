// QR 주문 다국어 지원
export type OrderLang = "ko" | "en" | "zh" | "ja";

export const ORDER_LANGS: { code: OrderLang; flag: string; label: string }[] = [
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
];

// sessionStorage에 언어 저장/불러오기
export function saveLang(lang: OrderLang) {
  if (typeof window !== "undefined") sessionStorage.setItem("scoops_lang", lang);
}
export function loadLang(): OrderLang {
  if (typeof window === "undefined") return "ko";
  return (sessionStorage.getItem("scoops_lang") as OrderLang) || "ko";
}

const translations: Record<string, Record<OrderLang, string>> = {
  // 매장 선택 화면
  "매장식사": { ko: "매장식사", en: "Dine In", zh: "堂食", ja: "店内飲食" },
  "포장": { ko: "포장", en: "Takeout", zh: "打包", ja: "テイクアウト" },
  "젤라또 · 소르베또 · 주류": { ko: "젤라또 · 소르베또 · 주류", en: "Gelato · Sorbetto · Drinks", zh: "冰淇淋 · 雪芭 · 酒类", ja: "ジェラート · ソルベット · ドリンク" },
  "젤라또 · 소르베또": { ko: "젤라또 · 소르베또", en: "Gelato · Sorbetto", zh: "冰淇淋 · 雪芭", ja: "ジェラート · ソルベット" },
  "QR 모바일 주문": { ko: "QR 모바일 주문", en: "QR Mobile Order", zh: "QR手机点餐", ja: "QRモバイル注文" },
  "공식홈페이지": { ko: "공식홈페이지", en: "Website", zh: "官网", ja: "公式サイト" },
  "인스타그램": { ko: "인스타그램", en: "Instagram", zh: "Instagram", ja: "Instagram" },

  // 메뉴 화면
  "젤라또 · 소르베또2": { ko: "젤라또 · 소르베또", en: "Gelato · Sorbetto", zh: "冰淇淋 · 雪芭", ja: "ジェラート · ソルベット" },
  "몇 가지 맛을 고르실 건가요?": { ko: "몇 가지 맛을 고르실 건가요?", en: "How many flavors?", zh: "请选择几种口味？", ja: "何種類の味を選びますか？" },
  "가지 맛": { ko: "가지 맛", en: "flavor(s)", zh: "种口味", ja: "種類" },
  "컵": { ko: "컵", en: "Cup", zh: "杯", ja: "カップ" },
  "맛 선택": { ko: "맛 선택", en: "Select flavors", zh: "选择口味", ja: "味を選ぶ" },
  "장바구니에 추가": { ko: "장바구니에 추가", en: "Add to cart", zh: "加入购物车", ja: "カートに追加" },
  "장바구니": { ko: "장바구니", en: "Cart", zh: "购物车", ja: "カート" },

  // 주류
  "주류": { ko: "주류", en: "Drinks", zh: "酒类", ja: "ドリンク" },
  "위스키": { ko: "위스키", en: "Whisky", zh: "威士忌", ja: "ウイスキー" },
  "와인": { ko: "와인", en: "Wine", zh: "葡萄酒", ja: "ワイン" },
  "리큐르": { ko: "리큐르", en: "Liqueur", zh: "利口酒", ja: "リキュール" },
  "소주": { ko: "소주", en: "Soju", zh: "烧酒", ja: "焼酎" },
  "담기": { ko: "담기", en: "Add", zh: "添加", ja: "追加" },

  // 맛 이름
  "생명쌀": { ko: "생명쌀", en: "Premium Rice", zh: "生命米", ja: "生命米" },
  "밀크티": { ko: "밀크티", en: "Milk Tea", zh: "奶茶", ja: "ミルクティー" },
  "쑥": { ko: "쑥", en: "Mugwort", zh: "艾草", ja: "よもぎ" },
  "오레오": { ko: "오레오", en: "Oreo", zh: "奥利奥", ja: "オレオ" },
  "소금치즈": { ko: "소금치즈", en: "Salt Cheese", zh: "盐芝士", ja: "塩チーズ" },
  "누텔라": { ko: "누텔라", en: "Nutella", zh: "能多益", ja: "ヌテラ" },
  "구운호두": { ko: "구운호두", en: "Roasted Walnut", zh: "烤核桃", ja: "ローストくるみ" },
  "티라미수": { ko: "티라미수", en: "Tiramisu", zh: "提拉米苏", ja: "ティラミス" },
  "민트초콜릿칩": { ko: "민트초콜릿칩", en: "Mint Choco Chip", zh: "薄荷巧克力", ja: "ミントチョコチップ" },
  "진한 초콜릿": { ko: "진한 초콜릿", en: "Dark Chocolate", zh: "浓巧克力", ja: "濃厚チョコレート" },
  "초코녹차": { ko: "초코녹차", en: "Choco Green Tea", zh: "巧克力绿茶", ja: "チョコ抹茶" },
  "피스타치오": { ko: "피스타치오", en: "Pistachio", zh: "开心果", ja: "ピスタチオ" },
  "딸기치즈케이크": { ko: "딸기치즈케이크", en: "Strawberry Cheesecake", zh: "草莓芝士蛋糕", ja: "ストロベリーチーズケーキ" },
  "바닐라빈": { ko: "바닐라빈", en: "Vanilla Bean", zh: "香草豆", ja: "バニラビーン" },
  "흑임자": { ko: "흑임자", en: "Black Sesame", zh: "黑芝麻", ja: "黒ごま" },
  // 소르베또
  "청포도": { ko: "청포도", en: "Green Grape", zh: "青葡萄", ja: "マスカット" },
  "패션후르츠": { ko: "패션후르츠", en: "Passion Fruit", zh: "百香果", ja: "パッションフルーツ" },
  "딸기": { ko: "딸기", en: "Strawberry", zh: "草莓", ja: "いちご" },
  "블루베리": { ko: "블루베리", en: "Blueberry", zh: "蓝莓", ja: "ブルーベリー" },
  "레몬": { ko: "레몬", en: "Lemon", zh: "柠檬", ja: "レモン" },

  // 팝업
  "장바구니에 담았습니다": { ko: "장바구니에 담았습니다", en: "Added to cart", zh: "已加入购物车", ja: "カートに追加しました" },
  "위스키·와인도 함께 어떠세요?": { ko: "위스키·와인도 함께 어떠세요?", en: "How about whisky or wine?", zh: "来杯威士忌或葡萄酒？", ja: "ウイスキーやワインはいかがですか？" },
  "젤라또도 함께 어떠세요?": { ko: "젤라또도 함께 어떠세요?", en: "How about some gelato?", zh: "来份冰淇淋？", ja: "ジェラートはいかがですか？" },
  "더 담기": { ko: "더 담기", en: "Add more", zh: "继续选购", ja: "もっと選ぶ" },
  "주문하기": { ko: "주문하기", en: "Order now", zh: "立即下单", ja: "注文する" },

  // 장바구니/결제
  "주문 내역": { ko: "주문 내역", en: "Order Summary", zh: "订单详情", ja: "注文内容" },
  "총 금액": { ko: "총 금액", en: "Total", zh: "总金额", ja: "合計金額" },
  "주문 완료!": { ko: "주문 완료!", en: "Order Complete!", zh: "下单成功！", ja: "注文完了！" },
  "주문번호": { ko: "주문번호", en: "Order No.", zh: "订单号", ja: "注文番号" },
  "카운터에서 주문번호를 말씀해주세요": { ko: "카운터에서 주문번호를 말씀해주세요", en: "Please tell the counter your order number", zh: "请在柜台告知订单号", ja: "カウンターで注文番号をお伝えください" },
  "새 주문하기": { ko: "새 주문하기", en: "New Order", zh: "重新点餐", ja: "新規注文" },

  // 연령 확인
  "연령 확인": { ko: "연령 확인", en: "Age Verification", zh: "年龄确认", ja: "年齢確認" },
  "주류 주문은 만 19세 이상만 가능합니다.": { ko: "주류 주문은 만 19세 이상만 가능합니다.", en: "You must be 19 or older to order alcohol.", zh: "订购酒类需年满19岁。", ja: "酒類の注文は19歳以上の方に限ります。" },
  "만 19세 이상입니다": { ko: "만 19세 이상입니다", en: "I am 19 or older", zh: "我已满19岁", ja: "19歳以上です" },
  "아니요": { ko: "아니요", en: "No", zh: "否", ja: "いいえ" },

  // 계좌이체
  "계좌번호": { ko: "계좌번호", en: "Account No.", zh: "账号", ja: "口座番号" },
  "우리은행": { ko: "우리은행", en: "Woori Bank", zh: "友利银行", ja: "ウリ銀行" },
  "복사됨": { ko: "복사됨!", en: "Copied!", zh: "已复制！", ja: "コピーしました！" },

  // 품절
  "품절": { ko: "품절", en: "Sold out", zh: "售罄", ja: "売り切れ" },
};

// 번역 함수
export function t(key: string, lang: OrderLang): string {
  if (lang === "ko") return key; // 한국어는 원본 그대로
  return translations[key]?.[lang] || key;
}

// 맛 이름 번역
export function tFlavor(name: string, lang: OrderLang): string {
  if (lang === "ko") return name;
  return translations[name]?.[lang] || name;
}
