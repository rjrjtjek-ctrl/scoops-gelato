import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 할일 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const date = req.nextUrl.searchParams.get("date");
    const recurring = req.nextUrl.searchParams.get("recurring");

    let storeFilter = "";
    if (user.role === "hq_admin") {
      const storeId = req.nextUrl.searchParams.get("storeId");
      if (storeId) storeFilter = `store_id=eq.${storeId}&`;
    } else {
      if (!user.storeId) return NextResponse.json({ tasks: [] });
      storeFilter = `store_id=eq.${user.storeId}&`;
    }

    let query = `${storeFilter}order=created_at.desc`;
    if (date) query = `${storeFilter}due_date=eq.${date}&order=created_at.asc`;
    if (recurring === "true") query = `${storeFilter}is_recurring=eq.true&order=created_at.asc`;

    const tasks = await supabaseSelect<any[]>("tasks", query);

    const result = await Promise.all(
      (tasks || []).map(async (t: any) => {
        let assigneeName = "";
        if (t.assigned_to) {
          const users = await supabaseSelect<any[]>("users", `id=eq.${t.assigned_to}&limit=1`);
          assigneeName = users?.[0]?.name || "";
        }
        return {
          id: t.id, title: t.title, description: t.description,
          status: t.status, dueDate: t.due_date, dueTime: t.due_time,
          assignedTo: t.assigned_to, assigneeName,
          isRecurring: t.is_recurring, recurPattern: t.recur_pattern,
          completedAt: t.completed_at, createdAt: t.created_at,
        };
      })
    );

    return NextResponse.json({ tasks: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 할일 추가
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee", "hq_admin"]);

    // 본사는 storeId 파라미터로 매장 지정, 점주는 자기 매장
    const body = await req.json();
    const storeId = user.storeId || body.storeId;
    if (!storeId) return NextResponse.json({ error: "매장을 선택해주세요." }, { status: 400 });

    const result = await supabaseInsert("tasks", {
      store_id: storeId,
      created_by: user.userId,
      assigned_to: body.assignedTo || null,
      title: body.title,
      description: body.description || null,
      due_date: body.dueDate || null,
      due_time: body.dueTime || null,
      is_recurring: body.isRecurring || false,
      recur_pattern: body.recurPattern || null,
    });

    return NextResponse.json({ task: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
