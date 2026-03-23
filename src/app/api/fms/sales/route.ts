import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 판매 통계
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const storeId = user.role === "hq_admin"
      ? req.nextUrl.searchParams.get("storeId")
      : user.storeId;

    const period = req.nextUrl.searchParams.get("period") || "today";
    const now = new Date();
    let startDate: string;

    switch (period) {
      case "week": startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0]; break;
      case "month": startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]; break;
      default: startDate = now.toISOString().split("T")[0];
    }

    // 기존 orders 테이블에서 판매 데이터 집계
    let query = `created_at=gte.${startDate}T00:00:00&status=eq.confirmed&order=created_at.desc`;
    if (storeId) query = `store_id=eq.${storeId}&${query}`;

    const orders = await supabaseSelect<any[]>("orders", query);

    const totalOrders = (orders || []).length;
    const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

    // 시간대별 통계
    const hourlyMap: Record<number, { orders: number; revenue: number }> = {};
    (orders || []).forEach((o: any) => {
      const hour = new Date(o.created_at).getHours();
      if (!hourlyMap[hour]) hourlyMap[hour] = { orders: 0, revenue: 0 };
      hourlyMap[hour].orders++;
      hourlyMap[hour].revenue += o.total_amount || 0;
    });

    const hourlyStats = Object.entries(hourlyMap)
      .map(([hour, data]) => ({ hour: Number(hour), ...data }))
      .sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
      hourlyStats,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}
