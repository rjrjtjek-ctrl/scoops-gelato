import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 발주 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const status = req.nextUrl.searchParams.get("status");

    let query = "order=created_at.desc";
    if (user.role !== "hq_admin") {
      query += `&store_id=eq.${user.storeId}`;
    } else {
      const storeId = req.nextUrl.searchParams.get("storeId");
      if (storeId) query += `&store_id=eq.${storeId}`;
    }
    if (status) query += `&status=eq.${status}`;

    const orders = await supabaseSelect<any[]>("hq_orders", query);

    const result = await Promise.all(
      (orders || []).map(async (o: any) => {
        const stores = await supabaseSelect<any[]>("stores", `id=eq.${o.store_id}&limit=1`);
        const users = await supabaseSelect<any[]>("users", `id=eq.${o.ordered_by}&limit=1`);
        return {
          id: o.id, storeId: o.store_id,
          storeName: stores?.[0]?.name || "",
          orderedBy: o.ordered_by,
          orderedByName: users?.[0]?.name || "",
          items: o.items, status: o.status,
          createdAt: o.created_at,
          confirmedAt: o.confirmed_at,
          completedAt: o.completed_at,
        };
      })
    );

    return NextResponse.json({ orders: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 발주 생성
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee", "employee"]);
    if (!user.storeId) {
      return NextResponse.json({ error: "매장이 지정되지 않았습니다." }, { status: 400 });
    }
    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "주문 항목이 없습니다." }, { status: 400 });
    }

    // 각 productId 유효성 검증
    for (const item of items) {
      const products = await supabaseSelect<any[]>("hq_products", `id=eq.${item.productId}&is_active=eq.true&limit=1`);
      if (!products || products.length === 0) {
        return NextResponse.json({ error: `유효하지 않은 제품: ${item.productId}` }, { status: 400 });
      }
    }

    const result = await supabaseInsert("hq_orders", {
      store_id: user.storeId,
      ordered_by: user.userId,
      items: JSON.stringify(items),
      status: "pending",
    });

    const order = Array.isArray(result) ? result[0] : result;
    return NextResponse.json({ order: { id: order?.id, status: "pending", items } });
  } catch (err) { return handleAuthError(err); }
}
