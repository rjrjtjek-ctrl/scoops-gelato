import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 공지 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    let query = "order=created_at.desc&limit=50";

    // 점주/직원은 자기 매장 대상 + 전체 공지만
    if (user.role !== "hq_admin" && user.storeId) {
      query = `or=(type.eq.all,target_store_id.eq.${user.storeId})&order=created_at.desc&limit=50`;
    }

    const announcements = await supabaseSelect<any[]>("announcements", query);

    // 읽음 상태 확인
    const result = await Promise.all(
      (announcements || []).map(async (a: any) => {
        const reads = await supabaseSelect<any[]>(
          "announcement_reads",
          `announcement_id=eq.${a.id}&user_id=eq.${user.userId}&limit=1`
        );
        return {
          id: a.id, title: a.title, content: a.content,
          type: a.type, targetStoreId: a.target_store_id,
          attachments: a.attachments, createdAt: a.created_at,
          isRead: reads && reads.length > 0,
        };
      })
    );

    return NextResponse.json({ announcements: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 공지 생성 (본사만)
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const body = await req.json();

    const result = await supabaseInsert("announcements", {
      title: body.title,
      content: body.content,
      type: body.type || "all",
      target_store_id: body.targetStoreId || null,
      attachments: body.attachments ? JSON.stringify(body.attachments) : null,
      created_by: user.userId,
    });

    return NextResponse.json({ announcement: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
