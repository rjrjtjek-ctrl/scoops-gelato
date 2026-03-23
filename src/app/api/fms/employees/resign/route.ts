import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// POST: 퇴사 처리
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee"]);
    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json({ error: "직원 ID가 필요합니다." }, { status: 400 });
    }

    // 해당 직원이 점주의 매장 소속인지 확인
    const emps = await supabaseSelect<any[]>(
      "employees_detail",
      `id=eq.${employeeId}&store_id=eq.${user.storeId}&limit=1`
    );
    if (!emps || emps.length === 0) {
      return NextResponse.json({ error: "직원을 찾을 수 없습니다." }, { status: 404 });
    }

    const emp = emps[0];
    const today = new Date().toISOString().split("T")[0];

    // 1. employees_detail에 퇴사일 기록
    await supabaseUpdate("employees_detail", `id=eq.${employeeId}`, { resign_date: today });

    // 2. users 비활성화
    await supabaseUpdate("users", `id=eq.${emp.user_id}`, { is_active: false });

    return NextResponse.json({ success: true, resignDate: today });
  } catch (err) {
    return handleAuthError(err);
  }
}
