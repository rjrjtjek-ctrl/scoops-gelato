import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 매장별 메뉴 ON/OFF 토글
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee"]);
    if (!user.storeId) return NextResponse.json({ error: "매장 없음" }, { status: 400 });

    const { menuItemId, isAvailable } = await req.json();
    if (!menuItemId) return NextResponse.json({ error: "메뉴 ID 필요" }, { status: 400 });

    // 기존 상태 확인
    const existing = await supabaseSelect<any[]>(
      "store_menu_status",
      `store_id=eq.${user.storeId}&menu_item_id=eq.${menuItemId}&limit=1`
    );

    if (existing && existing.length > 0) {
      await supabaseUpdate("store_menu_status", `id=eq.${existing[0].id}`, {
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
        updated_by: user.userId,
      });
    } else {
      await supabaseInsert("store_menu_status", {
        store_id: user.storeId,
        menu_item_id: menuItemId,
        is_available: isAvailable,
        updated_by: user.userId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
