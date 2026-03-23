import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 전체 요약 분석
export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);

    // 매장 수
    const stores = await supabaseSelect<any[]>("stores", "status=eq.active");
    const storeCount = (stores || []).length;

    // 직원 수
    const employees = await supabaseSelect<any[]>("users", "role=eq.employee&is_active=eq.true");
    const employeeCount = (employees || []).length;

    // 오늘 주문
    const today = new Date().toISOString().split("T")[0];
    const orders = await supabaseSelect<any[]>("orders", `created_at=gte.${today}T00:00:00&status=eq.confirmed`);
    const todayOrders = (orders || []).length;
    const todayRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

    // 발주 대기
    const pendingOrders = await supabaseSelect<any[]>("hq_orders", "status=eq.pending");
    const pendingCount = (pendingOrders || []).length;

    // 가맹문의
    const inquiries = await supabaseSelect<any[]>("inquiries", "order=created_at.desc&limit=5");
    const inquiryCount = (inquiries || []).length;

    return NextResponse.json({
      storeCount,
      employeeCount,
      todayOrders,
      todayRevenue,
      pendingOrders: pendingCount,
      recentInquiries: inquiryCount,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}
