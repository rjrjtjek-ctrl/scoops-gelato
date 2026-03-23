import { NextRequest, NextResponse } from "next/server";

// 임시 API: Supabase 테이블 생성 (1회용 — 생성 후 삭제)
export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase 설정 없음" }, { status: 500 });
  }

  const { secret } = await req.json();
  if (secret !== "scoops-setup-2026") {
    return NextResponse.json({ error: "인증 실패" }, { status: 403 });
  }

  // Supabase REST API로 테이블 존재 여부 확인 후, 없으면 RPC로 생성 시도
  // REST API로는 DDL 실행이 안 되므로, 테이블이 없을 때만 알려줌
  const tables = ["chat_messages", "hq_products", "hq_orders", "approved_products", "tasks", "task_logs", "menu_items", "store_menu_status", "announcements", "announcement_reads", "knowledge_base"];

  const results: Record<string, string> = {};
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
      results[table] = res.status === 200 ? "exists" : `missing (${res.status})`;
    } catch (e) {
      results[table] = "error";
    }
  }

  return NextResponse.json({ tables: results });
}
