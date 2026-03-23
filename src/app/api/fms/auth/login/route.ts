import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { comparePassword, generateToken } from "@/lib/fms/auth";

// POST: 로그인
export async function POST(req: NextRequest) {
  try {
    const { loginId, password, remember } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // 사용자 조회
    const users = await supabaseSelect<{
      id: string;
      login_id: string;
      password_hash: string;
      name: string;
      role: string;
      store_id: string | null;
      is_active: boolean;
    }[]>("users", `login_id=eq.${encodeURIComponent(loginId)}&is_active=eq.true&limit=1`);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const user = users[0];

    // 비밀번호 검증
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // 매장명 조회 (store_id가 있는 경우)
    let storeName: string | null = null;
    if (user.store_id) {
      const stores = await supabaseSelect<{ name: string }[]>(
        "stores",
        `id=eq.${user.store_id}&limit=1`
      );
      if (stores && stores.length > 0) {
        storeName = stores[0].name;
      }
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      loginId: user.login_id,
      role: user.role as "hq_admin" | "franchisee" | "employee",
      storeId: user.store_id,
      name: user.name,
    });

    // 응답 생성
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        loginId: user.login_id,
        name: user.name,
        role: user.role,
        storeId: user.store_id,
        storeName,
      },
    });

    // 쿠키 설정
    const cookieOptions: Record<string, unknown> = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    if (remember) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7일
    }
    // remember=false면 세션 쿠키 (브라우저 닫으면 삭제)

    response.cookies.set("fms_token", token, cookieOptions);

    // 기존 admin 세션도 함께 설정 (기존 관리자 페이지 접근 호환)
    if (user.role === "hq_admin") {
      response.cookies.set("admin_session", "scoops_admin_session_2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
        maxAge: 24 * 60 * 60,
      });
      response.cookies.set("scoops_admin", "true", {
        httpOnly: false,
        secure: false,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    console.error("[FMS] 로그인 실패:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
