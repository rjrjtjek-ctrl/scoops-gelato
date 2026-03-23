import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./auth";

export function getTokenFromRequest(req: NextRequest): string | null {
  // 1) Authorization 헤더
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2) 쿠키
  const cookie = req.cookies.get("fms_token");
  return cookie?.value || null;
}

export function authenticate(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest, allowedRoles?: string[]): JWTPayload {
  const user = authenticate(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function handleAuthError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (message === "FORBIDDEN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  return NextResponse.json({ error: "서버 오류" }, { status: 500 });
}
