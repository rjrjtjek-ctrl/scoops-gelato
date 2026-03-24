import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/fms/middleware";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";

// GET: 계좌 정보 조회
export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const userId = new URL(req.url).searchParams.get("userId") || user.userId;

  try {
    const accounts = await supabaseSelect<any[]>("employee_bank_accounts", `user_id=eq.${userId}`);
    return NextResponse.json({ account: accounts[0] || null });
  } catch (err) {
    console.error("[bank-accounts] GET:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// POST: 계좌 등록/수정 (UPSERT)
export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const body = await req.json();
  const { bankName, accountNumber, accountHolder } = body;
  const userId = body.userId || user.userId;

  if (!bankName || !accountNumber || !accountHolder) {
    return NextResponse.json({ error: "은행명, 계좌번호, 예금주 필요" }, { status: 400 });
  }

  try {
    // 기존 계좌가 있는지 확인
    const existing = await supabaseSelect<any[]>("employee_bank_accounts", `user_id=eq.${userId}`);

    if (existing.length > 0) {
      await supabaseUpdate("employee_bank_accounts", `user_id=eq.${userId}`, {
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
      });
    } else {
      await supabaseInsert("employee_bank_accounts", {
        user_id: userId,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bank-accounts] POST:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
