import { NextRequest, NextResponse } from "next/server";
import { supabaseInsert, supabaseSelect } from "@/lib/supabase-client";

// 봇 필터링
const BOT_PATTERN = /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|Baidu|DuckDuckBot|facebookexternalhit|LinkedInBot|Twitterbot|WhatsApp|Bytespider|GPTBot|ClaudeBot|SemrushBot|AhrefsBot|MJ12bot|DotBot|PetalBot|YandexBot|Sogou|Exabot|ia_archiver|archive\.org|HeadlessChrome|PhantomJS|Selenium|puppeteer/i;

function parseDevice(ua: string): string {
  if (/iPad|tablet/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/whale/i.test(ua)) return "Whale";
  if (/kakaotalk/i.test(ua)) return "KakaoTalk";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "기타";
}

// GET: 방문 통계 조회
export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const rows = await supabaseSelect<Array<{
      id: string; path: string; device: string; browser: string;
      ip: string; session_id: string | null; created_at: string;
    }>>("visit_logs", `order=created_at.desc&limit=2000`);

    // 일별 통계
    const dailyStats: Record<string, number> = {};
    const pageStats: Record<string, number> = {};

    rows.forEach((log) => {
      const date = log.created_at.split("T")[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
      pageStats[log.path] = (pageStats[log.path] || 0) + 1;
    });

    const dailyArray = Object.entries(dailyStats)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30)
      .map(([date, count]) => ({ date, count }));

    const pageArray = Object.entries(pageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([path, count]) => ({ path, count }));

    // 오늘 고유 방문자 (IP 기준)
    const todayRows = rows.filter((r) => r.created_at.startsWith(todayStr));
    const todayUniqueIPs = new Set(todayRows.map((r) => r.ip)).size;

    // 디바이스 분포
    const deviceStats: Record<string, number> = {};
    const browserStats: Record<string, number> = {};
    rows.forEach((r) => {
      deviceStats[r.device] = (deviceStats[r.device] || 0) + 1;
      browserStats[r.browser] = (browserStats[r.browser] || 0) + 1;
    });

    // 지역 분석 (session_id에 저장된 geo JSON 파싱)
    const regionStats: Record<string, number> = {};
    const cityStats: Record<string, number> = {};
    const ispStats: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.session_id) {
        try {
          const geo = JSON.parse(r.session_id);
          if (geo.region) regionStats[geo.region] = (regionStats[geo.region] || 0) + 1;
          if (geo.city) cityStats[geo.city] = (cityStats[geo.city] || 0) + 1;
          if (geo.isp) ispStats[geo.isp] = (ispStats[geo.isp] || 0) + 1;
        } catch {}
      }
    });

    const regionArray = Object.entries(regionStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([region, count]) => ({ region, count }));

    const cityArray = Object.entries(cityStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([city, count]) => ({ city, count }));

    const ispArray = Object.entries(ispStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([isp, count]) => ({ isp, count }));

    return NextResponse.json({
      totalVisits: rows.length,
      todayVisits: todayRows.length,
      todayUniqueVisitors: todayUniqueIPs,
      dailyStats: dailyArray,
      pageStats: pageArray,
      deviceStats,
      browserStats,
      regionStats: regionArray,
      cityStats: cityArray,
      ispStats: ispArray,
    });
  } catch (err) {
    console.error("[analytics] GET 실패:", err);
    return NextResponse.json({ totalVisits: 0, todayVisits: 0, dailyStats: [], pageStats: [] });
  }
}

// POST: 방문 로그 기록
export async function POST(req: NextRequest) {
  try {
    // 관리자 기기 제외
    const adminCookie = req.cookies.get("scoops_admin");
    if (adminCookie?.value === "true") {
      return NextResponse.json({ success: true });
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 봇 필터링
    if (BOT_PATTERN.test(ua)) {
      return NextResponse.json({ success: true, filtered: "bot" });
    }

    const body = await req.json();
    const { path } = body;

    const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // IP 지역 조회 (비동기 — 실패해도 방문 기록은 저장)
    let geoInfo = "";
    try {
      const firstIp = ip.split(",")[0].trim();
      if (firstIp && firstIp !== "unknown" && firstIp !== "::1" && firstIp !== "127.0.0.1") {
        const geoRes = await fetch(`http://ip-api.com/json/${firstIp}?fields=country,regionName,city,isp&lang=ko`, { signal: AbortSignal.timeout(2000) });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          geoInfo = JSON.stringify({ region: geo.regionName, city: geo.city, isp: geo.isp, country: geo.country });
        }
      }
    } catch {}

    await supabaseInsert("visit_logs", {
      id,
      path: path || "/",
      user_agent: ua,
      ip,
      session_id: geoInfo || null,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      referrer: req.headers.get("referer") || "direct",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[analytics] POST 실패:", err);
    return NextResponse.json({ success: true }); // 실패해도 클라이언트 영향 없음
  }
}
