import { NextRequest, NextResponse } from "next/server";
import { supabaseInsert, supabaseSelect } from "@/lib/supabase-client";

// POST: PWA 설치 기록 — Supabase 영구 저장
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "unknown";
    const id = `pwa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    await supabaseInsert("pwa_installs", {
      id,
      user_agent: ua,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[pwa-install] INSERT 실패:", err);
    return NextResponse.json({ success: true }); // 실패해도 클라이언트 영향 없음
  }
}

// GET: 설치 통계 조회 (관리자용)
export async function GET() {
  try {
    const rows = await supabaseSelect<Array<{
      id: string; store_code: string | null; user_agent: string; created_at: string;
    }>>("pwa_installs", "order=created_at.desc&limit=500");

    const total = rows.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter((l) => l.created_at.startsWith(today)).length;

    // 최근 7일 일별
    const dailyCounts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyCounts[d.toISOString().slice(0, 10)] = 0;
    }
    rows.forEach((l) => {
      const day = l.created_at.slice(0, 10);
      if (dailyCounts[day] !== undefined) dailyCounts[day]++;
    });

    // 최근 10건
    const recent = rows.slice(0, 10).map((l) => ({
      timestamp: l.created_at,
      device: /iPhone|iPad/.test(l.user_agent) ? "iOS"
        : /Android/.test(l.user_agent) ? "Android" : "기타",
    }));

    return NextResponse.json({ total, todayCount, dailyCounts, recent });
  } catch (err) {
    console.error("[pwa-install] GET 실패:", err);
    return NextResponse.json({ total: 0, todayCount: 0, dailyCounts: {}, recent: [] });
  }
}
