// 가맹문의 데이터 저장 유틸리티
// Supabase 테이블 사용 (Edge Config에서 전환)
// 테이블 없으면 인메모리 폴백

import { supabaseSelect, supabaseInsert, supabaseUpdate } from "./supabase-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

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

// ── 인메모리 폴백 (Supabase 테이블 없을 때) ──
let memoryInquiries: Inquiry[] = [];

// ── Supabase DB 매핑 ──
interface DbInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  message: string | null;
  time: string;
  kakao_sent: boolean;
  kakao_error: string | null;
  read: boolean;
  created_at: string;
}

function dbToInquiry(row: DbInquiry): Inquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    region: row.region,
    message: row.message || undefined,
    time: row.time,
    kakaoSent: row.kakao_sent,
    kakaoError: row.kakao_error || undefined,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function saveInquiry(inquiry: Omit<Inquiry, "id" | "read" | "createdAt">): Promise<Inquiry> {
  const newId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // Supabase 시도
  if (SUPABASE_URL) {
    try {
      const rows = await supabaseInsert<DbInquiry[]>("inquiries", {
        id: newId,
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        region: inquiry.region,
        message: inquiry.message || null,
        time: inquiry.time,
        kakao_sent: inquiry.kakaoSent,
        kakao_error: inquiry.kakaoError || null,
        read: false,
        created_at: now,
      });
      if (rows && rows.length > 0) return dbToInquiry(rows[0]);
    } catch (err) {
      console.warn("[inquiries] Supabase INSERT 실패, 인메모리 폴백:", err);
    }
  }

  // 인메모리 폴백
  const newInquiry: Inquiry = {
    ...inquiry,
    id: newId,
    read: false,
    createdAt: now,
  };
  memoryInquiries.unshift(newInquiry);
  if (memoryInquiries.length > 500) memoryInquiries.length = 500;
  return newInquiry;
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (SUPABASE_URL) {
    try {
      const rows = await supabaseSelect<DbInquiry[]>("inquiries", "order=created_at.desc&limit=500");
      return rows.map(dbToInquiry);
    } catch (err) {
      console.warn("[inquiries] Supabase SELECT 실패, 인메모리 폴백:", err);
    }
  }
  return memoryInquiries;
}

export async function markAsRead(id: string): Promise<boolean> {
  if (SUPABASE_URL) {
    try {
      await supabaseUpdate("inquiries", `id=eq.${id}`, { read: true });
      return true;
    } catch (err) {
      console.warn("[inquiries] Supabase UPDATE 실패:", err);
    }
  }
  // 인메모리 폴백
  const inquiry = memoryInquiries.find((i) => i.id === id);
  if (!inquiry) return false;
  inquiry.read = true;
  return true;
}

export async function getUnreadCount(): Promise<number> {
  const inquiries = await getInquiries();
  return inquiries.filter((i) => !i.read).length;
}
