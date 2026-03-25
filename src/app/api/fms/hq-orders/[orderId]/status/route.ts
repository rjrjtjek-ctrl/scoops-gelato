import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { sendStoreNotification } from "@/lib/kakao";

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

    // 점주에게 카카오 알림
    try {
      const orders = await supabaseSelect<any[]>("hq_orders", `id=eq.${orderId}&limit=1`);
      if (orders?.[0]?.store_id) {
        const stores = await supabaseSelect<any[]>("stores", `id=eq.${orders[0].store_id}&limit=1`);
        const storeName = stores?.[0]?.name || "매장";
        const statusLabel = status === "confirmed" ? "확인됨" : "완료";
        sendStoreNotification({
          storeName,
          type: "general",
          title: `발주가 "${statusLabel}" 처리되었습니다`,
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
