import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 할일 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const date = req.nextUrl.searchParams.get("date");
    const recurring = req.nextUrl.searchParams.get("recurring");
    const history = req.nextUrl.searchParams.get("history"); // "true"면 과거 전체
    const purchaseOnly = req.nextUrl.searchParams.get("purchase"); // "true"면 구매요청만

    let storeFilter = "";
    if (user.role === "hq_admin") {
      const storeId = req.nextUrl.searchParams.get("storeId");
      if (storeId) storeFilter = `store_id=eq.${storeId}&`;
    } else {
      if (!user.storeId) return NextResponse.json({ tasks: [] });
      storeFilter = `store_id=eq.${user.storeId}&`;
    }

    let query = `${storeFilter}status=neq.deleted&order=created_at.desc`;

    if (date) {
      // 특정 날짜 할일 + 이전 미완료 이월분
      const overdueTasks = await supabaseSelect<any[]>(
        "tasks",
        `${storeFilter}status=eq.pending&due_date=lt.${date}&order=due_date.asc`
      );

      const todayTasks = await supabaseSelect<any[]>(
        "tasks",
        `${storeFilter}status=neq.deleted&due_date=eq.${date}&order=created_at.asc`
      );

      // 미완료 이월분을 오늘 날짜로 자동 이월 (DB에서 날짜는 안 바꾸고 UI에서 같이 표시)
      const allTasks = [...(overdueTasks || []), ...(todayTasks || [])];
      // 중복 제거
      const seen = new Set<string>();
      const unique = allTasks.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });

      const result = await mapTasks(unique);
      return NextResponse.json({ tasks: result, overdueCount: (overdueTasks || []).length }, { headers: { "Cache-Control": "no-store" } });
    }

    if (recurring === "true") {
      query = `${storeFilter}status=neq.deleted&is_recurring=eq.true&order=created_at.asc`;
    }

    if (history === "true") {
      // 과거 전체 (최근 100건)
      query = `${storeFilter}status=neq.deleted&order=due_date.desc,created_at.desc&limit=100`;
    }

    if (purchaseOnly === "true") {
      // 구매요청만 (제목에 [구매요청] 포함)
      query = `${storeFilter}status=neq.deleted&title=like.*구매요청*&order=created_at.desc&limit=50`;
    }

    const tasks = await supabaseSelect<any[]>("tasks", query);
    const result = await mapTasks(tasks || []);

    return NextResponse.json({ tasks: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// 할일 데이터 매핑 (담당자 이름 조회 포함)
async function mapTasks(tasks: any[]) {
  // 담당자 ID 수집 → 일괄 조회
  const assigneeIds = [...new Set(tasks.filter(t => t.assigned_to).map(t => t.assigned_to))];
  const nameMap: Record<string, string> = {};

  if (assigneeIds.length > 0) {
    for (const aid of assigneeIds) {
      const users = await supabaseSelect<any[]>("users", `id=eq.${aid}&limit=1`);
      if (users?.[0]) nameMap[aid] = users[0].name;
    }
  }

  return tasks.map((t: any) => ({
    id: t.id, title: t.title, description: t.description,
    status: t.status, dueDate: t.due_date, dueTime: t.due_time,
    assignedTo: t.assigned_to, assigneeName: nameMap[t.assigned_to] || "",
    isRecurring: t.is_recurring, recurPattern: t.recur_pattern,
    completedAt: t.completed_at, createdAt: t.created_at,
    isOverdue: t.due_date && t.due_date < new Date().toISOString().split("T")[0] && t.status === "pending",
  }));
}

// POST: 할일 추가
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee", "hq_admin"]);

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
