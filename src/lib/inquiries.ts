// 가맹문의 데이터 저장 유틸리티
// Vercel Edge Config 기반 영구 저장소 사용

import { edgeGet, edgeSet } from "./edge-store";

const INQUIRIES_KEY = "inquiries";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  message?: string;
  time: string;
  kakaoSent: boolean;
  kakaoError?: string;
  read: boolean;
  createdAt: string;
}

async function readInquiries(): Promise<Inquiry[]> {
  return edgeGet<Inquiry[]>(INQUIRIES_KEY, []);
}

async function writeInquiries(inquiries: Inquiry[]): Promise<void> {
  await edgeSet(INQUIRIES_KEY, inquiries);
}

export async function saveInquiry(inquiry: Omit<Inquiry, "id" | "read" | "createdAt">): Promise<Inquiry> {
  const inquiries = await readInquiries();
  const newInquiry: Inquiry = {
    ...inquiry,
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInquiry); // 최신순
  // 최대 500건 유지 (Edge Config 용량 제한)
  if (inquiries.length > 500) inquiries.length = 500;
  await writeInquiries(inquiries);
  return newInquiry;
}

export async function getInquiries(): Promise<Inquiry[]> {
  return readInquiries();
}

export async function markAsRead(id: string): Promise<boolean> {
  const inquiries = await readInquiries();
  const inquiry = inquiries.find((i) => i.id === id);
  if (!inquiry) return false;
  inquiry.read = true;
  await writeInquiries(inquiries);
  return true;
}

export async function getUnreadCount(): Promise<number> {
  const inquiries = await readInquiries();
  return inquiries.filter((i) => !i.read).length;
}
