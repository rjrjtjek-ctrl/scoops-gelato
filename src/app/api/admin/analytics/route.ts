import { NextRequest, NextResponse } from "next/server";
import { recordPageView, recordSessionComplete, getAnalyticsSummary } from "@/lib/analytics";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "scoops8893!";

// 방문 기록 (클라이언트에서 호출)
export async function POST(req: NextRequest) {
  try {
    // sendBeacon은 Content-Type이 text/plain일 수 있음
    let body;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 세션 완료 (사용자 이탈 시 전체 여정 저장)
    if (body.type === "session_complete") {
      const result = await recordSessionComplete({
        sessionId: body.sessionId,
        ip,
        userAgent,
        referrer: body.referrer || "",
        pages: body.pages || [],
      });
      return NextResponse.json({ ok: result.ok, sessionId: result.sessionId });
    }

    // 개별 페이지뷰 (실시간 모니터링용)
    if (body.type === "pageview" || !body.type) {
      const result = await recordPageView({
        page: body.page,
        referrer: body.referrer || "",
        userAgent,
        ip,
        sessionId: body.sessionId,
      });
      return NextResponse.json({ ok: result.ok });
    }

    return NextResponse.json({ ok: false, error: "unknown type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "기록 실패", detail: String(err) }, { status: 500 });
  }
}

// 분석 데이터 조회 (관리자용)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth.replace("Bearer ", "") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const summary = await getAnalyticsSummary();
  return NextResponse.json(summary);
}
