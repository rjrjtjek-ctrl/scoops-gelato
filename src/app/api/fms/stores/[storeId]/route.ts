import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseUpdate, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { hashPassword } from "@/lib/fms/auth";

// GET: 매장 상세
export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { storeId } = await params;

    const stores = await supabaseSelect<any[]>("stores", `id=eq.${storeId}&limit=1`);
    if (!stores || stores.length === 0) {
      return NextResponse.json({ error: "매장을 찾을 수 없습니다." }, { status: 404 });
    }

    const store = stores[0];
    const owners = await supabaseSelect<any[]>("users", `store_id=eq.${storeId}&role=eq.franchisee&limit=1`);
    const employees = await supabaseSelect<any[]>("employees_detail", `store_id=eq.${storeId}&order=created_at.desc`);

    // 직원 사용자 정보 조회
    const employeeList = await Promise.all(
      (employees || []).map(async (emp: any) => {
        const users = await supabaseSelect<any[]>("users", `id=eq.${emp.user_id}&limit=1`);
        const u = users?.[0];
        return {
          id: emp.id,
          userId: emp.user_id,
          name: u?.name || "",
          phone: u?.phone || "",
          position: emp.position,
          hireDate: emp.hire_date,
          resignDate: emp.resign_date,
          isActive: u?.is_active ?? true,
        };
      })
    );

    return NextResponse.json({
      store: {
        id: store.id, name: store.name, address: store.address,
        areaSqm: store.area_sqm, seats: store.seats,
        businessHours: store.business_hours, phone: store.phone,
        openDate: store.open_date, notes: store.notes, status: store.status,
      },
      owner: owners?.[0] ? { id: owners[0].id, name: owners[0].name, phone: owners[0].phone, email: owners[0].email, loginId: owners[0].login_id, isActive: owners[0].is_active } : null,
      employees: employeeList,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleAuthError(err);
  }
}

// PATCH: 매장 수정
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { storeId } = await params;
    const body = await req.json();

    // 점주 등록 요청
    if (body.createOwner) {
      const { name, phone, email, loginId, password } = body.createOwner;
      if (!name || !loginId || !password) {
        return NextResponse.json({ error: "이름, 아이디, 비밀번호는 필수입니다." }, { status: 400 });
      }
      // 중복 체크
      const existing = await supabaseSelect<any[]>("users", `login_id=eq.${loginId}`);
      if (existing.length > 0) {
        return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      await supabaseInsert("users", {
        login_id: loginId,
        password_hash: passwordHash,
        name,
        phone: phone || null,
        email: email || null,
        role: "franchisee",
        store_id: storeId,
      });
      return NextResponse.json({ success: true, message: "점주 등록 완료" });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.areaSqm !== undefined) updateData.area_sqm = body.areaSqm;
    if (body.seats !== undefined) updateData.seats = body.seats;
    if (body.businessHours !== undefined) updateData.business_hours = body.businessHours;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    await supabaseUpdate("stores", `id=eq.${storeId}`, updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleAuthError(err);
  }
}
