import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 작업 기록 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];

    let storeFilter = "";
    if (user.role === "hq_admin") {
      const storeId = req.nextUrl.searchParams.get("storeId");
      if (storeId) storeFilter = `store_id=eq.${storeId}&`;
    } else {
      if (!user.storeId) return NextResponse.json({ logs: [] });
      storeFilter = `store_id=eq.${user.storeId}&`;
    }

    const logs = await supabaseSelect<any[]>(
      "task_logs",
      `${storeFilter}created_at=gte.${date}T00:00:00&created_at=lt.${date}T23:59:59&order=created_at.asc`
    );

    const result = await Promise.all(
      (logs || []).map(async (l: any) => {
        const users = await supabaseSelect<any[]>("users", `id=eq.${l.user_id}&limit=1`);
        return {
          id: l.id, taskId: l.task_id, userId: l.user_id,
          userName: users?.[0]?.name || "",
          action: l.action, description: l.description,
          photoUrl: l.photo_url, createdAt: l.created_at,
        };
      })
    );

    return NextResponse.json({ logs: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 작업 기록 추가
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user.storeId) return NextResponse.json({ error: "매장 없음" }, { status: 400 });

    const body = await req.json();
    const result = await supabaseInsert("task_logs", {
      task_id: body.taskId || null,
      user_id: user.userId,
      store_id: user.storeId,
      action: body.action || "completed",
      description: body.description,
      photo_url: body.photoUrl || null,
    });

    return NextResponse.json({ log: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
