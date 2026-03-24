import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/fms/middleware";
import { supabaseSelect } from "@/lib/supabase-client";

// 2026년 최저임금
const MIN_WAGE = 10360; // 원/시간

// GET: 급여 계산
export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  if (user.role !== "franchisee" && user.role !== "hq_admin") {
    return NextResponse.json({ error: "점주 이상 권한 필요" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") || user.storeId;
  const month = searchParams.get("month"); // YYYY-MM
  const userId = searchParams.get("userId");

  if (!storeId || !month) {
    return NextResponse.json({ error: "storeId, month 필요" }, { status: 400 });
  }

  try {
    // 해당 월 출퇴근 기록 조회
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;

    let query = `store_id=eq.${storeId}&clock_in=gte.${month}-01T00:00:00%2B09:00&clock_in=lt.${nextMonth}-01T00:00:00%2B09:00&clock_out=not.is.null`;
    if (userId) query += `&user_id=eq.${userId}`;
    query += `&order=clock_in.asc`;

    const records = await supabaseSelect<any[]>("attendance", query);

    // 직원별 집계
    const byUser: Record<string, { totalMinutes: number; weeklyHours: Record<string, number>; records: any[] }> = {};

    records.forEach((r: any) => {
      if (!byUser[r.user_id]) {
        byUser[r.user_id] = { totalMinutes: 0, weeklyHours: {}, records: [] };
      }
      const mins = r.work_minutes || 0;
      byUser[r.user_id].totalMinutes += mins;
      byUser[r.user_id].records.push(r);

      // 주별 시간 계산 (주휴수당용)
      const d = new Date(r.clock_in);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      byUser[r.user_id].weeklyHours[weekKey] = (byUser[r.user_id].weeklyHours[weekKey] || 0) + mins / 60;
    });

    // 직원 정보 + 계좌 정보 가져오기
    const userIds = Object.keys(byUser);
    if (userIds.length === 0) {
      return NextResponse.json({ payroll: [], month, totalAmount: 0 });
    }

    const usersQuery = `id=in.(${userIds.join(",")})&select=id,name,login_id`;
    const users = await supabaseSelect<any[]>("users", usersQuery);

    const banksQuery = `user_id=in.(${userIds.join(",")})`;
    const banks = await supabaseSelect<any[]>("employee_bank_accounts", banksQuery).catch(() => []);

    const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]));
    const bankMap = Object.fromEntries((banks as any[]).map((b: any) => [b.user_id, b]));

    // 급여 계산
    const payroll = userIds.map(uid => {
      const data = byUser[uid];
      const totalHours = Math.round(data.totalMinutes / 6) / 10; // 소수점 1자리
      const basePay = Math.round((data.totalMinutes / 60) * MIN_WAGE);

      // 주휴수당: 주 15시간 이상 근무한 주에 대해 일급 1일분 추가
      let weeklyAllowance = 0;
      let qualifiedWeeks = 0;
      Object.values(data.weeklyHours).forEach(hours => {
        if (hours >= 15) {
          // 주휴수당 = (주 소정근로시간 / 5) × 시급
          const dailyHours = hours / 5;
          weeklyAllowance += Math.round(dailyHours * MIN_WAGE);
          qualifiedWeeks++;
        }
      });

      const totalPay = basePay + weeklyAllowance;
      const bank = bankMap[uid];
      const userInfo = userMap[uid];

      return {
        userId: uid,
        name: userInfo?.name || "알 수 없음",
        loginId: userInfo?.login_id,
        totalMinutes: data.totalMinutes,
        totalHours,
        workDays: data.records.length,
        basePay,
        weeklyAllowance,
        qualifiedWeeks,
        totalPay,
        bankName: bank?.bank_name || null,
        accountNumber: bank?.account_number || null,
        accountHolder: bank?.account_holder || null,
      };
    });

    const totalAmount = payroll.reduce((sum, p) => sum + p.totalPay, 0);

    return NextResponse.json({ payroll, month, minWage: MIN_WAGE, totalAmount });
  } catch (err) {
    console.error("[payroll] GET:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
