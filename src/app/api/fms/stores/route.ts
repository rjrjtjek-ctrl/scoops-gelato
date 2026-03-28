import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert, supabaseDelete } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { hashPassword } from "@/lib/fms/auth";

// GET: 매장 목록
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ["hq_admin"]);
    const status = req.nextUrl.searchParams.get("status");

    let query = "select=*&order=created_at.desc";
    if (status) query += `&status=eq.${status}`;

    const stores = await supabaseSelect<any[]>("stores", query);

    // 각 매장의 점주 정보 조회
    const result = await Promise.all(
      (stores || []).map(async (store: any) => {
        const owners = await supabaseSelect<any[]>(
          "users",
          `store_id=eq.${store.id}&role=eq.franchisee&limit=1`
        );
        const owner = owners?.[0] || null;
        return {
          id: store.id,
          name: store.name,
          address: store.address,
          areaSqm: store.area_sqm,
          seats: store.seats,
          businessHours: store.business_hours,
          phone: store.phone,
          openDate: store.open_date,
          notes: store.notes,
          status: store.status,
          createdAt: store.created_at,
          owner: owner
            ? { id: owner.id, name: owner.name, phone: owner.phone, email: owner.email, loginId: owner.login_id }
            : null,
        };
      })
    );

    return NextResponse.json({ stores: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleAuthError(err);
  }
}

// POST: 매장 등록 + 점주 계정 생성
export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { store, owner } = await req.json();

    if (!store?.name || !owner?.loginId || !owner?.password || !owner?.name) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 0. 로그인 ID 중복 체크
    const existingUsers = await supabaseSelect<any[]>("users", `login_id=eq.${owner.loginId}`);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
    }

    // 1. 매장 생성
    const storeResult = await supabaseInsert("stores", {
      name: store.name,
      address: store.address || null,
      area_sqm: store.areaSqm || null,
      seats: store.seats || null,
      business_hours: store.businessHours || null,
      phone: store.phone || null,
      open_date: store.openDate || null,
      notes: store.notes || null,
    });

    const newStore = Array.isArray(storeResult) ? storeResult[0] : storeResult;
    if (!newStore?.id) {
      return NextResponse.json({ error: "매장 생성 실패" }, { status: 500 });
    }

    // 2. 점주 계정 생성
    const passwordHash = await hashPassword(owner.password);
    let userResult;
    try {
      userResult = await supabaseInsert("users", {
        login_id: owner.loginId,
        password_hash: passwordHash,
        name: owner.name,
        phone: owner.phone || null,
        email: owner.email || null,
        role: "franchisee",
        store_id: newStore.id,
      });
    } catch (userErr) {
      // 점주 계정 생성 실패 시 매장도 삭제 (롤백)
      await supabaseDelete("stores", `id=eq.${newStore.id}`).catch(() => {});
      return NextResponse.json({ error: "점주 계정 생성 실패. 아이디를 확인해주세요." }, { status: 500 });
    }

    const newUser = Array.isArray(userResult) ? userResult[0] : userResult;

    return NextResponse.json({
      store: newStore,
      owner: {
        id: newUser?.id,
        loginId: owner.loginId,
        name: owner.name,
        tempPassword: "********", // 보안: 비밀번호 API 노출 금지 — UI에서 직접 표시
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
