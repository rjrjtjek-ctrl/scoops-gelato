import { NextRequest, NextResponse } from "next/server";

// 인메모리 PWA 설치 로그 (Supabase 전환 전 임시)
interface PwaInstallLog {
  id: string;
  timestamp: string;
  userAgent: string;
}

const installLogs: PwaInstallLog[] =
  ((globalThis as Record<string, unknown>).__pwaInstallLogs as PwaInstallLog[]) || [];
if (!(globalThis as Record<string, unknown>).__pwaInstallLogs) {
  (globalThis as Record<string, unknown>).__pwaInstallLogs = installLogs;
}

// POST: 설치 기록
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "unknown";
    const log: PwaInstallLog = {
      id: `pwa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userAgent: ua,
    };
    installLogs.push(log);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "기록 실패" }, { status: 500 });
  }
}

// GET: 설치 통계 조회 (관리자용)
export async function GET() {
  const total = installLogs.length;

  // 오늘 설치 수
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = installLogs.filter((l) => l.timestamp.slice(0, 10) === today).length;

  // 최근 7일 일별
  const dailyCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyCounts[key] = 0;
  }
  installLogs.forEach((l) => {
    const day = l.timestamp.slice(0, 10);
    if (dailyCounts[day] !== undefined) dailyCounts[day]++;
  });

  // 최근 10건
  const recent = installLogs.slice(-10).reverse().map((l) => ({
    timestamp: l.timestamp,
    device: /iPhone|iPad/.test(l.userAgent)
      ? "iOS"
      : /Android/.test(l.userAgent)
      ? "Android"
      : "기타",
  }));

  return NextResponse.json({
    total,
    todayCount,
    dailyCounts,
    recent,
  });
}
