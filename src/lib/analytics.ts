// 방문자 전체 여정 추적 시스템
// GitHub Contents API 기반 — 무제한 데이터 저장
// 세션 단위로 입장~이탈까지 전체 경로 기록

import { githubGet, githubSet } from "./github-store";

const SESSIONS_PATH = "data/analytics-sessions.json";
const STATS_PATH = "data/analytics-stats.json";

// ── 타입 정의 ──

export interface PageStep {
  page: string;       // 페이지 경로
  enterAt: string;    // 진입 시각 (ISO)
  dwellSec: number;   // 체류 시간 (초)
}

export interface SessionRecord {
  sid: string;          // 세션 ID
  ip: string;
  device: string;       // mobile | desktop | tablet
  browser: string;
  referrer: string;     // 유입 경로
  startAt: string;      // 세션 시작
  endAt: string;        // 세션 종료
  durationSec: number;  // 총 체류 시간 (초)
  pages: PageStep[];    // 전체 페이지 여정
  exitPage: string;     // 이탈 페이지
  pageCount: number;    // 방문 페이지 수
  isBounce: boolean;    // 바운스 (1페이지만 보고 이탈)
}

export interface DailyStat {
  date: string;           // YYYY-MM-DD
  pageViews: number;
  sessions: number;
  uniqueIPs: number;
  bounceCount: number;
  avgDurationSec: number;
}

export interface PageStat {
  views: number;
  exits: number;
  totalDwellSec: number;
  bounces: number;
}

export interface AnalyticsStats {
  totalPageViews: number;
  totalSessions: number;
  dailyStats: DailyStat[];   // 최근 90일
  pageStats: Record<string, PageStat>;
}

// ── UA 파싱 ──

function parseDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    if (/ipad|tablet/i.test(ua)) return "tablet";
    return "mobile";
  }
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/whale/i.test(ua)) return "Whale";
  if (/kakaotalk/i.test(ua)) return "KakaoTalk";
  return "기타";
}

// ── 페이지뷰 기록 (개별 페이지 방문 시 호출) ──

export async function recordPageView(data: {
  page: string;
  referrer: string;
  userAgent: string;
  ip: string;
  sessionId: string;
}): Promise<{ ok: boolean }> {
  // 개별 페이지뷰는 Edge Config에 경량 기록 (실시간용)
  // 세션 완료 시 전체 여정은 GitHub에 저장
  try {
    const { edgeGet, edgeSet } = await import("./edge-store");
    const visits = await edgeGet<Array<{
      id: string; page: string; ip: string; device: string;
      browser: string; timestamp: string; sessionId: string;
    }>>("visits", []);

    const visit = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      page: data.page,
      ip: data.ip,
      device: parseDevice(data.userAgent),
      browser: parseBrowser(data.userAgent),
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId,
    };
    visits.unshift(visit);
    if (visits.length > 30) visits.length = 30;
    await edgeSet("visits", visits);
    return { ok: true };
  } catch {
    // Edge Config 실패해도 세션 완료 시 GitHub에 저장됨
    return { ok: true };
  }
}

// ── 세션 완료 기록 (사용자 이탈 시 호출) ──

export async function recordSessionComplete(data: {
  sessionId: string;
  ip: string;
  userAgent: string;
  referrer: string;
  pages: Array<{ page: string; enterAt: string; dwellSec: number }>;
}): Promise<{ ok: boolean; sessionId: string }> {
  const device = parseDevice(data.userAgent);
  const browser = parseBrowser(data.userAgent);

  if (!data.pages || data.pages.length === 0) {
    return { ok: false, sessionId: data.sessionId };
  }

  const session: SessionRecord = {
    sid: data.sessionId,
    ip: data.ip,
    device,
    browser,
    referrer: data.referrer || "direct",
    startAt: data.pages[0].enterAt,
    endAt: data.pages[data.pages.length - 1].enterAt,
    durationSec: data.pages.reduce((sum, p) => sum + p.dwellSec, 0),
    pages: data.pages,
    exitPage: data.pages[data.pages.length - 1].page,
    pageCount: data.pages.length,
    isBounce: data.pages.length === 1,
  };

  // GitHub에 세션 저장 (같은 sid가 이미 있으면 덮어쓰기 — 중복 방지)
  const { data: sessions, sha } = await githubGet<SessionRecord[]>(SESSIONS_PATH, []);
  const existingIdx = sessions.findIndex((s) => s.sid === session.sid);
  if (existingIdx >= 0) {
    // 기존 세션보다 페이지가 더 많은 경우에만 업데이트 (최신 데이터)
    if (session.pages.length >= sessions[existingIdx].pages.length) {
      sessions[existingIdx] = session;
    }
  } else {
    sessions.unshift(session);
  }
  // 최근 500세션 유지
  if (sessions.length > 500) sessions.length = 500;
  const writeOk = await githubSet(SESSIONS_PATH, sessions, sha, `analytics: session ${session.sid}`);

  // 통계 업데이트
  if (writeOk) {
    await updateStats(session);
  }

  return { ok: writeOk, sessionId: session.sid };
}

// ── 통계 업데이트 ──

async function updateStats(session: SessionRecord) {
  const { data: stats, sha } = await githubGet<AnalyticsStats>(STATS_PATH, {
    totalPageViews: 0,
    totalSessions: 0,
    dailyStats: [],
    pageStats: {},
  });

  // 총계 업데이트
  stats.totalPageViews += session.pageCount;
  stats.totalSessions += 1;

  // 일별 통계
  const dateStr = session.startAt.split("T")[0];
  let dayStat = stats.dailyStats.find((d) => d.date === dateStr);
  if (!dayStat) {
    dayStat = { date: dateStr, pageViews: 0, sessions: 0, uniqueIPs: 0, bounceCount: 0, avgDurationSec: 0 };
    stats.dailyStats.unshift(dayStat);
  }
  dayStat.pageViews += session.pageCount;
  dayStat.sessions += 1;
  if (session.isBounce) dayStat.bounceCount += 1;
  // 평균 체류시간 누적 계산
  dayStat.avgDurationSec = Math.round(
    ((dayStat.avgDurationSec * (dayStat.sessions - 1)) + session.durationSec) / dayStat.sessions
  );

  // 90일 초과 데이터 삭제
  if (stats.dailyStats.length > 90) stats.dailyStats.length = 90;

  // 페이지별 통계
  for (const step of session.pages) {
    if (!stats.pageStats[step.page]) {
      stats.pageStats[step.page] = { views: 0, exits: 0, totalDwellSec: 0, bounces: 0 };
    }
    const ps = stats.pageStats[step.page];
    ps.views += 1;
    ps.totalDwellSec += step.dwellSec;
  }
  // 이탈 페이지 카운트
  if (stats.pageStats[session.exitPage]) {
    stats.pageStats[session.exitPage].exits += 1;
  }
  // 바운스 카운트
  if (session.isBounce && stats.pageStats[session.exitPage]) {
    stats.pageStats[session.exitPage].bounces += 1;
  }

  await githubSet(STATS_PATH, stats, sha, `analytics: stats update`);
}

// ── 분석 데이터 조회 ──

export async function getAnalyticsSummary(): Promise<{
  // 기본 통계
  todayVisits: number;
  todayUniqueVisitors: number;
  todaySessions: number;
  totalVisits: number;
  totalSessions: number;
  // 세션 목록 (전체 여정 포함)
  recentSessions: SessionRecord[];
  // 페이지별 분석
  topPages: { page: string; views: number; exits: number; exitRate: number; avgDwell: number }[];
  // 이탈 분석
  bounceRate: number;
  exitPages: { page: string; exits: number; exitRate: number }[];
  // 디바이스/브라우저
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  // 일별 추이
  dailyTrend: DailyStat[];
  // 사용자 여정 흐름
  journeyFlows: { from: string; to: string; count: number }[];
}> {
  const { data: sessions } = await githubGet<SessionRecord[]>(SESSIONS_PATH, []);
  const { data: stats } = await githubGet<AnalyticsStats>(STATS_PATH, {
    totalPageViews: 0,
    totalSessions: 0,
    dailyStats: [],
    pageStats: {},
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => s.startAt.startsWith(todayStr));
  const todayIPs = new Set(todaySessions.map((s) => s.ip));

  // 페이지별 분석
  const topPages = Object.entries(stats.pageStats)
    .map(([page, ps]) => ({
      page,
      views: ps.views,
      exits: ps.exits,
      exitRate: ps.views > 0 ? Math.round((ps.exits / ps.views) * 100) : 0,
      avgDwell: ps.views > 0 ? Math.round(ps.totalDwellSec / ps.views) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // 이탈 페이지 순위
  const exitPages = Object.entries(stats.pageStats)
    .filter(([, ps]) => ps.exits > 0)
    .map(([page, ps]) => ({
      page,
      exits: ps.exits,
      exitRate: ps.views > 0 ? Math.round((ps.exits / ps.views) * 100) : 0,
    }))
    .sort((a, b) => b.exits - a.exits)
    .slice(0, 10);

  // 바운스율
  const totalBounces = sessions.filter((s) => s.isBounce).length;
  const bounceRate = sessions.length > 0 ? Math.round((totalBounces / sessions.length) * 100) : 0;

  // 디바이스 분포
  const deviceCount = new Map<string, number>();
  for (const s of sessions) {
    deviceCount.set(s.device, (deviceCount.get(s.device) || 0) + 1);
  }
  const deviceBreakdown = [...deviceCount.entries()].map(([device, count]) => ({ device, count }));

  // 브라우저 분포
  const browserCount = new Map<string, number>();
  for (const s of sessions) {
    browserCount.set(s.browser, (browserCount.get(s.browser) || 0) + 1);
  }
  const browserBreakdown = [...browserCount.entries()]
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count);

  // 사용자 여정 흐름 (페이지 간 이동 패턴)
  const flowMap = new Map<string, number>();
  for (const s of sessions) {
    for (let i = 0; i < s.pages.length - 1; i++) {
      const key = `${s.pages[i].page} → ${s.pages[i + 1].page}`;
      flowMap.set(key, (flowMap.get(key) || 0) + 1);
    }
  }
  const journeyFlows = [...flowMap.entries()]
    .map(([key, count]) => {
      const [from, to] = key.split(" → ");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  return {
    todayVisits: todaySessions.reduce((sum, s) => sum + s.pageCount, 0),
    todayUniqueVisitors: todayIPs.size,
    todaySessions: todaySessions.length,
    totalVisits: stats.totalPageViews,
    totalSessions: stats.totalSessions,
    recentSessions: sessions.slice(0, 100),
    topPages,
    bounceRate,
    exitPages,
    deviceBreakdown,
    browserBreakdown,
    dailyTrend: stats.dailyStats.slice(0, 30),
    journeyFlows,
  };
}
