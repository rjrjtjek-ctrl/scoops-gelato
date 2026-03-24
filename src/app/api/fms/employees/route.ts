import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { hashPassword } from "@/lib/fms/auth";

// GET: 직원 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin", "franchisee"]);
    const countOnly = req.nextUrl.searchParams.get("count");

    let storeFilter = "";
    if (user.role === "franchisee") {
      storeFilter = `store_id=eq.${user.storeId}`;
    } else {
      const storeId = req.nextUrl.searchParams.get("storeId");
      if (storeId) storeFilter = `store_id=eq.${storeId}`;
    }

    const query = storeFilter
      ? `${storeFilter}&order=created_at.desc`
      : "order=created_at.desc";

    const employees = await supabaseSelect<any[]>("employees_detail", query);

    if (countOnly === "true") {
      // 활성 직원만 카운트
      const activeCount = await Promise.all(
        (employees || []).map(async (emp: any) => {
          const users = await supabaseSelect<any[]>("users", `id=eq.${emp.user_id}&is_active=eq.true&limit=1`);
          return users && users.length > 0 ? 1 : 0;
        })
      );
      return NextResponse.json({ count: activeCount.reduce((a: number, b: number) => a + b, 0) });
    }

    const result = await Promise.all(
      (employees || []).map(async (emp: any) => {
        const users = await supabaseSelect<any[]>("users", `id=eq.${emp.user_id}&limit=1`);
        const u = users?.[0];
        return {
          id: emp.id,
          userId: emp.user_id,
          name: u?.name || "",
          phone: u?.phone || "",
          email: u?.email || "",
          loginId: u?.login_id || "",
          position: emp.position,
          hireDate: emp.hire_date,
          resignDate: emp.resign_date,
          characteristics: emp.characteristics,
          residentNum: emp.resident_num,
          isActive: u?.is_active ?? true,
        };
      })
    );

    return NextResponse.json({ employees: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleAuthError(err);
  }
}

// POST: 직원 등록
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["franchisee"]);
    if (!user.storeId) {
      return NextResponse.json({ error: "매장이 지정되지 않았습니다." }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone, email, residentNum, position, hireDate, loginId, password, characteristics } = body;

    if (!name || !position || !hireDate || !loginId || !password) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 로그인 ID 중복 체크
    const dupCheck = await supabaseSelect<any[]>("users", `login_id=eq.${loginId}`);
    if (dupCheck.length > 0) {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
    }

    // 현재 매장 활성 직원 수 확인
    const existing = await supabaseSelect<any[]>(
      "employees_detail",
      `store_id=eq.${user.storeId}&resign_date=is.null`
    );
    if (existing && existing.length >= 5) {
      return NextResponse.json({ error: "직원은 매장당 최대 5명까지 등록 가능합니다." }, { status: 400 });
    }

    // 1. users 테이블에 직원 계정 생성
    const passwordHash = await hashPassword(password);
    const userResult = await supabaseInsert("users", {
      login_id: loginId,
      password_hash: passwordHash,
      name,
      phone: phone || null,
      email: email || null,
      role: "employee",
      store_id: user.storeId,
    });
    const newUser = Array.isArray(userResult) ? userResult[0] : userResult;

    if (!newUser?.id) {
      return NextResponse.json({ error: "계정 생성 실패" }, { status: 500 });
    }

    // 주민등록번호 마스킹 (앞 6자리만 보관)
    let maskedResidentNum = null;
    if (residentNum) {
      const cleaned = residentNum.replace(/[^0-9]/g, "");
      maskedResidentNum = cleaned.substring(0, 6) + "-*******";
    }

    // 2. employees_detail 테이블에 상세 정보 생성
    const empResult = await supabaseInsert("employees_detail", {
      user_id: newUser.id,
      store_id: user.storeId,
      resident_num: maskedResidentNum,
      position,
      hire_date: hireDate,
      characteristics: characteristics || null,
    });

    const newEmp = Array.isArray(empResult) ? empResult[0] : empResult;

    return NextResponse.json({
      employee: {
        id: newEmp?.id,
        userId: newUser.id,
        name,
        loginId,
        position,
        hireDate,
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
