// 서버 사이드 인메모리 데이터 스토어
// 프로덕션에서는 DB(Supabase, PlanetScale 등)로 교체 권장

export interface CustomerPost {
  id: string;
  category: string;
  author: string;
  title: string;
  content: string;
  status: "확인중" | "답변완료";
  reply?: string;
  createdAt: string;
}

export interface FranchiseInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  budget: string;
  message: string;
  status: "신규" | "상담중" | "완료";
  createdAt: string;
}

export interface VisitLog {
  path: string;
  timestamp: string;
  userAgent: string;
  ip: string;
}

// 글로벌 인메모리 저장소 (서버리스 환경에서는 콜드스타트 시 초기화됨)
const globalStore = globalThis as unknown as {
  __customerPosts?: CustomerPost[];
  __franchiseInquiries?: FranchiseInquiry[];
  __visitLogs?: VisitLog[];
};

// 더미 고객 글
const defaultCustomerPosts: CustomerPost[] = [
  {
    id: "c1",
    category: "매장 이용",
    author: "김*현",
    title: "청주본점 서비스가 너무 좋아요",
    content: "처음 방문했는데 직원분이 맛을 하나하나 추천해주셔서 좋았어요. 피스타치오 젤라또 최고입니다!",
    status: "답변완료",
    reply: "소중한 후기 감사합니다! 앞으로도 좋은 서비스로 보답하겠습니다.",
    createdAt: "2026-03-15T10:30:00",
  },
  {
    id: "c2",
    category: "메뉴",
    author: "이*수",
    title: "소르베또 종류가 더 다양했으면",
    content: "과일 소르베또를 좋아하는데 계절마다 바뀌는 메뉴가 있었으면 좋겠어요. 딸기 소르베또 출시 부탁드립니다!",
    status: "답변완료",
    reply: "좋은 의견 감사합니다! 봄 시즌 딸기 소르베또를 준비 중입니다.",
    createdAt: "2026-03-12T14:20:00",
  },
  {
    id: "c3",
    category: "매장 이용",
    author: "박*진",
    title: "여의도점 분위기 좋아요",
    content: "인테리어가 새로워졌더라구요. 깔끔하고 따뜻한 느낌이라 커피 마시며 쉬기 좋습니다.",
    status: "답변완료",
    reply: "방문해주셔서 감사합니다! 편안한 공간이 되도록 노력하겠습니다.",
    createdAt: "2026-03-08T16:45:00",
  },
  {
    id: "c4",
    category: "가맹",
    author: "최*아",
    title: "가맹 상담 후기",
    content: "가맹 상담 받았는데 친절하게 설명해주셔서 좋았습니다. 좋은 결과 있었으면 좋겠네요.",
    status: "답변완료",
    reply: "상담해주셔서 감사합니다. 좋은 결과 함께 만들어가겠습니다!",
    createdAt: "2026-03-05T11:00:00",
  },
  {
    id: "c5",
    category: "기타",
    author: "정*민",
    title: "기프트카드 있나요?",
    content: "선물용으로 기프트카드가 있으면 좋겠습니다. 친구 생일선물로 주고 싶어요.",
    status: "확인중",
    createdAt: "2026-02-28T09:15:00",
  },
];

// 더미 가맹문의
const defaultFranchiseInquiries: FranchiseInquiry[] = [
  {
    id: "f1",
    name: "홍길동",
    phone: "010-1234-5678",
    email: "hong@email.com",
    region: "서울 강남구",
    budget: "1억원 ~ 2억원",
    message: "강남역 근처에 매장을 열고 싶습니다. 상권 분석도 가능한가요?",
    status: "상담중",
    createdAt: "2026-03-14T09:00:00",
  },
  {
    id: "f2",
    name: "김영희",
    phone: "010-9876-5432",
    email: "kim@email.com",
    region: "경기 수원시",
    budget: "5,000만원 ~ 1억원",
    message: "수원 광교 신도시 쪽으로 관심 있습니다.",
    status: "신규",
    createdAt: "2026-03-16T15:30:00",
  },
];

export function getCustomerPosts(): CustomerPost[] {
  if (!globalStore.__customerPosts) {
    globalStore.__customerPosts = [...defaultCustomerPosts];
  }
  return globalStore.__customerPosts;
}

export function addCustomerPost(post: Omit<CustomerPost, "id" | "status" | "createdAt">): CustomerPost {
  const posts = getCustomerPosts();
  const newPost: CustomerPost = {
    ...post,
    id: "c" + Date.now(),
    status: "확인중",
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  return newPost;
}

export function replyToCustomerPost(id: string, reply: string): CustomerPost | null {
  const posts = getCustomerPosts();
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.reply = reply;
    post.status = "답변완료";
    return post;
  }
  return null;
}

export function getFranchiseInquiries(): FranchiseInquiry[] {
  if (!globalStore.__franchiseInquiries) {
    globalStore.__franchiseInquiries = [...defaultFranchiseInquiries];
  }
  return globalStore.__franchiseInquiries;
}

export function addFranchiseInquiry(inquiry: Omit<FranchiseInquiry, "id" | "status" | "createdAt">): FranchiseInquiry {
  const inquiries = getFranchiseInquiries();
  const newInquiry: FranchiseInquiry = {
    ...inquiry,
    id: "f" + Date.now(),
    status: "신규",
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInquiry);
  return newInquiry;
}

export function updateInquiryStatus(id: string, status: FranchiseInquiry["status"]): FranchiseInquiry | null {
  const inquiries = getFranchiseInquiries();
  const inquiry = inquiries.find((i) => i.id === id);
  if (inquiry) {
    inquiry.status = status;
    return inquiry;
  }
  return null;
}

export function getVisitLogs(): VisitLog[] {
  if (!globalStore.__visitLogs) {
    globalStore.__visitLogs = [];
  }
  return globalStore.__visitLogs;
}

export function addVisitLog(log: VisitLog) {
  const logs = getVisitLogs();
  logs.push(log);
  // 최대 1000개만 유지
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
}
