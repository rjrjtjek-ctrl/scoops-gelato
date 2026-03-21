import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, setAdminSession, clearAdminSession, isAdminAuthenticated } from "@/lib/auth";

// 로그인 상태 확인
export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

// 로그인
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password } = body;

    if (!verifyCredentials(id, password)) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 로그아웃
export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
