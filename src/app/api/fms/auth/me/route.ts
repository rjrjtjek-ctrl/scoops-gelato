import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { authenticate } from "@/lib/fms/middleware";

// GET: 현재 로그인한 사용자 정보
export async function GET(req: NextRequest) {
  try {
    const payload = authenticate(req);
    if (!payload) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 최신 사용자 정보 조회
    const users = await supabaseSelect<{
      id: string;
      login_id: string;
      name: string;
      role: string;
      store_id: string | null;
      phone: string | null;
      email: string | null;
      is_active: boolean;
    }[]>("users", `id=eq.${payload.userId}&limit=1`);

    if (!users || users.length === 0 || !users[0].is_active) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const user = users[0];

    // 매장명 조회
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

    return NextResponse.json({
      user: {
        id: user.id,
        loginId: user.login_id,
        name: user.name,
        role: user.role,
        storeId: user.store_id,
        storeName,
        phone: user.phone,
        email: user.email,
      },
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("[FMS] me 실패:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
