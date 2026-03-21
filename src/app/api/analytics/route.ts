import { NextRequest, NextResponse } from "next/server";
import { getVisitLogs, addVisitLog } from "@/lib/store";

// 방문 로그 조회 (관리자)
export async function GET() {
  const logs = getVisitLogs();

  // 일별 통계 계산
  const dailyStats: Record<string, number> = {};
  const pageStats: Record<string, number> = {};

  logs.forEach((log) => {
    const date = log.timestamp.split("T")[0];
    dailyStats[date] = (dailyStats[date] || 0) + 1;
    pageStats[log.path] = (pageStats[log.path] || 0) + 1;
  });

  // 일별 통계를 배열로 변환 (최근 30일)
  const dailyArray = Object.entries(dailyStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30)
    .map(([date, count]) => ({ date, count }));

  // 페이지별 통계를 배열로 (상위 20개)
  const pageArray = Object.entries(pageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([path, count]) => ({ path, count }));

  return NextResponse.json({
    totalVisits: logs.length,
    todayVisits: dailyStats[new Date().toISOString().split("T")[0]] || 0,
    dailyStats: dailyArray,
    pageStats: pageArray,
  });
}

// 방문 로그 기록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path } = body;

    addVisitLog({
      path: path || "/",
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "unknown",
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
