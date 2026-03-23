import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 할일 수정/상태 변경
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    requireAuth(req);
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
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
