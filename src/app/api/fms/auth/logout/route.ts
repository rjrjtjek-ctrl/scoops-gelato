import { NextResponse } from "next/server";

// POST: 로그아웃
export async function POST() {
  const response = NextResponse.json({ success: true });

  // fms_token 쿠키 삭제
  response.cookies.set("fms_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
