import { cookies } from "next/headers";

// 관리자 계정 (프로덕션에서는 환경변수 또는 DB로 관리)
const ADMIN_ID = "scoopsgelato";
const ADMIN_PW = "scoops8893!";
const SESSION_TOKEN = "scoops_admin_session_2026";

export function verifyCredentials(id: string, pw: string): boolean {
  return id === ADMIN_ID && pw === ADMIN_PW;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", SESSION_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24시간
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === SESSION_TOKEN;
}
