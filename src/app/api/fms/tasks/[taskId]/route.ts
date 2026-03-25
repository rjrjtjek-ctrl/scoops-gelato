import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { sendStoreNotification } from "@/lib/kakao";

// PATCH: 할일 수정/상태 변경
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = requireAuth(req);
    const { taskId } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "completed") data.completed_at = new Date().toISOString();
    }
    if (body.assignedTo !== undefined) data.assigned_to = body.assignedTo;

    await supabaseUpdate("tasks", `id=eq.${taskId}`, data);

    // 직원이 할일 완료 시 → 점주에게 카카오 알림
    if (body.status === "completed" && user.role === "employee" && user.storeId) {
      try {
        const tasks = await supabaseSelect<any[]>("tasks", `id=eq.${taskId}&limit=1`);
        const stores = await supabaseSelect<any[]>("stores", `id=eq.${user.storeId}&limit=1`);
        const taskTitle = tasks?.[0]?.title || "할일";
        const storeName = stores?.[0]?.name || "매장";
        sendStoreNotification({
          storeName,
          type: "task_complete",
          title: taskTitle,
          employeeName: user.name,
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
