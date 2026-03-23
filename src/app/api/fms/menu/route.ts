import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 메뉴 목록
export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const storeId = req.nextUrl.searchParams.get("storeId");
    const items = await supabaseSelect<any[]>("menu_items", "order=sort_order.asc,created_at.asc");

    let storeStatuses: any[] = [];
    if (storeId) {
      storeStatuses = await supabaseSelect<any[]>("store_menu_status", `store_id=eq.${storeId}`) || [];
    }

    const result = (items || []).map((item: any) => {
      const status = storeStatuses.find((s: any) => s.menu_item_id === item.id);
      return {
        id: item.id, name: item.name, category: item.category,
        description: item.description, price: item.price,
        imageUrl: item.image_url, isActive: item.is_active,
        sortOrder: item.sort_order,
        storeStatus: status ? { isAvailable: status.is_available, updatedAt: status.updated_at } : undefined,
      };
    });

    return NextResponse.json({ menuItems: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 메뉴 추가 (본사만)
export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const result = await supabaseInsert("menu_items", {
      name: body.name, category: body.category,
      description: body.description || null, price: body.price,
      image_url: body.imageUrl || null, sort_order: body.sortOrder || 0,
    });
    return NextResponse.json({ menuItem: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
