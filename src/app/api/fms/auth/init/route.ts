import { NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { hashPassword } from "@/lib/fms/auth";

// POST: 초기 본사 관리자 계정 생성 (1회용)
export async function POST() {
  try {
    // 이미 hq_admin 계정이 있는지 확인
    const existing = await supabaseSelect<{ id: string }[]>(
      "users",
      "role=eq.hq_admin&limit=1"
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "이미 초기화되었습니다.", exists: true });
    }

    // 비밀번호 해시 생성
    const passwordHash = await hashPassword("scoops8893!");

    // 본사 관리자 계정 생성
    await supabaseInsert("users", {
      login_id: "scoopsgelato",
      password_hash: passwordHash,
      name: "정석주",
      role: "hq_admin",
      store_id: null,
      phone: "010-0000-0000",
      email: "scoopsgelato10@gmail.com",
      is_active: true,
    });

    return NextResponse.json({ message: "본사 관리자 계정이 생성되었습니다.", created: true });
  } catch (err) {
    console.error("[FMS] init 실패:", err);
    return NextResponse.json({ error: "초기화 실패" }, { status: 500 });
  }
}
