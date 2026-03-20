import { NextRequest, NextResponse } from "next/server";
import { getInquiries, getUnreadCount, markAsRead } from "@/lib/inquiries";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "scoops8893!";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === ADMIN_PASSWORD;
}

// 문의 목록 조회
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const inquiries = await getInquiries();
  const unreadCount = await getUnreadCount();

  return NextResponse.json({ inquiries, unreadCount });
}

// 문의 읽음 처리
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "문의 ID가 필요합니다." }, { status: 400 });
  }

  const result = await markAsRead(id);
  return NextResponse.json({ success: result });
}
