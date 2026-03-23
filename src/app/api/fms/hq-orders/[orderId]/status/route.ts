import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 발주 상태 변경 (본사만)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { orderId } = await params;
    const { status } = await req.json();

    if (!["confirmed", "completed"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "confirmed") updateData.confirmed_at = new Date().toISOString();
    if (status === "completed") updateData.completed_at = new Date().toISOString();

    await supabaseUpdate("hq_orders", `id=eq.${orderId}`, updateData);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
