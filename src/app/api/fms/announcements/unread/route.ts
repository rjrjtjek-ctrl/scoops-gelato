import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 미읽은 공지 수
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);

    // 전체 공지 중 내가 읽지 않은 것 카운트
    const announcements = await supabaseSelect<any[]>(
      "announcements",
      `order=created_at.desc&limit=50`
    );

    if (!announcements || announcements.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // 내가 읽은 공지 목록
    const reads = await supabaseSelect<any[]>(
      "announcement_reads",
      `user_id=eq.${user.userId}`
    );
    const readIds = new Set((reads || []).map((r: any) => r.announcement_id));

    // 나에게 해당하는 공지 필터링
    const myAnnouncements = (announcements || []).filter((a: any) => {
      if (a.type === "all") return true;
      if (a.target_store_id === user.storeId) return true;
      if (a.created_by === user.userId) return true;
      return false;
    });

    const unreadCount = myAnnouncements.filter((a: any) => !readIds.has(a.id)).length;

    return NextResponse.json({ unreadCount }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}
