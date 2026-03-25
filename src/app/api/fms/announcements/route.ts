import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { sendStoreNotification } from "@/lib/kakao";

/*
 * 공지사항 권한 규칙:
 * - 본사(hq_admin) 작성 → type='hq' → 모든 사용자에게 보임
 * - 점주(franchisee) 작성 → type='franchisee' → 해당 점주 본인 + 본사만 보임 (직원·다른점주 못봄)
 * - 직원(employee) 작성 → type='employee' → 해당 직원 본인 + 본사만 보임 (점주 못봄)
 * - 본사는 모든 공지 관제 가능
 * - 점주끼리 상호작용 불가
 */

// GET: 공지 목록 (역할별 필터링)
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);

    // 전체 공지 가져온 후 서버에서 필터링
    const all = await supabaseSelect<any[]>("announcements", "order=created_at.desc&limit=100");

    let filtered = (all || []).filter((a: any) => {
      // 본사는 모든 공지 관제 가능
      if (user.role === "hq_admin") return true;

      // 본사가 쓴 공지(type='hq' 또는 'all') → 모든 사용자에게 보임
      if (a.type === "hq" || a.type === "all") return true;

      // 자기가 쓴 공지 → 본인에게 보임
      if (a.created_by === user.userId) return true;

      // 점주가 쓴 공지 → 해당 점주만 (다른 점주·직원 못 봄)
      if (a.type === "franchisee" && user.role === "franchisee" && a.created_by === user.userId) return true;

      // 직원이 쓴 공지 → 해당 직원만 (점주 못 봄)
      if (a.type === "employee" && user.role === "employee" && a.created_by === user.userId) return true;

      return false;
    });

    // 읽음 상태 확인
    const result = await Promise.all(
      filtered.map(async (a: any) => {
        const reads = await supabaseSelect<any[]>(
          "announcement_reads",
          `announcement_id=eq.${a.id}&user_id=eq.${user.userId}&limit=1`
        );

        // 작성자 이름 조회
        let authorName = "";
        let authorRole = "";
        if (a.created_by) {
          const users = await supabaseSelect<any[]>("users", `id=eq.${a.created_by}&limit=1`);
          if (users?.[0]) {
            authorName = users[0].name;
            authorRole = users[0].role;
          }
        }

        return {
          id: a.id, title: a.title, content: a.content,
          type: a.type, targetStoreId: a.target_store_id,
          createdAt: a.created_at,
          isRead: reads && reads.length > 0,
          authorName,
          authorRole,
        };
      })
    );

    return NextResponse.json({ announcements: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 공지 작성 (모든 역할 가능)
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const body = await req.json();

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    // 역할에 따라 type 자동 설정
    let type = "all";
    if (user.role === "hq_admin") type = "hq";
    else if (user.role === "franchisee") type = "franchisee";
    else if (user.role === "employee") type = "employee";

    const result = await supabaseInsert("announcements", {
      title: body.title.trim(),
      content: body.content.trim(),
      type,
      target_store_id: user.storeId || null,
      created_by: user.userId,
    });

    // 본사 공지 시 카카오 알림
    if (user.role === "hq_admin") {
      sendStoreNotification({
        storeName: "전체 매장",
        type: "announcement",
        title: body.title.trim(),
      }).catch(() => {});
    }

    return NextResponse.json({ announcement: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
