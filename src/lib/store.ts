// 서버 사이드 데이터 스토어
// 고객의 소리(customer_posts)는 Supabase에 영구 저장 (콜드스타트 유실 방지)
// 나머지(가맹문의 더미, 방문로그)는 아직 인메모리 — 실제 데이터는 별도 시스템 사용

import { supabaseSelect, supabaseInsert, supabaseUpdate } from "./supabase-client";

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

// ── customer_posts DB 매핑 (snake_case ↔ CustomerPost) ──
interface DbCustomerPost {
  id: string;
  category: string;
  author: string;
  title: string;
  content: string;
  status: "확인중" | "답변완료";
  reply: string | null;
  created_at: string;
}

function dbToCustomerPost(row: DbCustomerPost): CustomerPost {
  return {
    id: row.id,
    category: row.category,
    author: row.author,
    title: row.title,
    content: row.content,
    status: row.status,
    reply: row.reply || undefined,
    createdAt: row.created_at,
  };
}

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

export async function getCustomerPosts(): Promise<CustomerPost[]> {
  const rows = await supabaseSelect<DbCustomerPost[]>(
    "customer_posts",
    "order=created_at.desc&limit=500"
  );
  return rows.map(dbToCustomerPost);
}

export async function addCustomerPost(
  post: Omit<CustomerPost, "id" | "status" | "createdAt">
): Promise<CustomerPost> {
  const newId = "c" + Date.now();
  const now = new Date().toISOString();
  const rows = await supabaseInsert<DbCustomerPost[]>("customer_posts", {
    id: newId,
    category: post.category,
    author: post.author,
    title: post.title,
    content: post.content,
    status: "확인중",
    reply: null,
    created_at: now,
  });
  if (rows && rows.length > 0) return dbToCustomerPost(rows[0]);
  // INSERT는 됐지만 응답 본문이 비어있는 경우 대비
  return { ...post, id: newId, status: "확인중", createdAt: now };
}

export async function replyToCustomerPost(id: string, reply: string): Promise<CustomerPost | null> {
  const rows = await supabaseUpdate<DbCustomerPost[]>(
    "customer_posts",
    `id=eq.${id}`,
    { reply, status: "답변완료" }
  );
  if (rows && rows.length > 0) return dbToCustomerPost(rows[0]);
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
