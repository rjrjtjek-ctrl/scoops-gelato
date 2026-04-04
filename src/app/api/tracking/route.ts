import { NextRequest, NextResponse } from "next/server";
import { supabaseInsert, supabaseSelect } from "@/lib/supabase-client";

// ============================================
// 추적 이벤트 로그 — Supabase 영구 저장
// ============================================

// 봇 필터링 — 허수 방지
const BOT_PATTERN = /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|Baidu|DuckDuckBot|facebookexternalhit|LinkedInBot|Twitterbot|WhatsApp|Bytespider|GPTBot|ClaudeBot|SemrushBot|AhrefsBot|MJ12bot|DotBot|PetalBot|YandexBot|Sogou|Exabot|ia_archiver|archive\.org|HeadlessChrome|PhantomJS|Selenium|puppeteer/i;

// POST: 이벤트 기록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, storeCode, data } = body;

    if (!event) {
      return NextResponse.json({ error: "event 필수" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 봇 필터링
    if (BOT_PATTERN.test(ua)) {
      return NextResponse.json({ success: true, filtered: "bot" });
    }

    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Supabase에 저장
    try {
      await supabaseInsert("tracking_events", {
        id,
        event,
        store_code: storeCode || null,
        data: data || null,
        user_agent: ua,
        ip,
      });
    } catch (err) {
      console.error("[tracking] Supabase INSERT 실패:", err);
      // Supabase 실패해도 클라이언트에는 성공 응답 (UX 영향 없음)
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "기록 실패" }, { status: 500 });
  }
}

// GET: 분석 데이터 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  // Supabase에서 조회
  let filtered: Array<{
    id: string;
    event: string;
    store_code: string | null;
    data: Record<string, unknown> | null;
    user_agent: string;
    ip: string;
    created_at: string;
  }> = [];

  try {
    filtered = await supabaseSelect<typeof filtered>(
      "tracking_events",
      `created_at=gte.${cutoffStr}&order=created_at.desc&limit=5000`
    );
  } catch (err) {
    console.error("[tracking] Supabase SELECT 실패:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }

  // 이벤트별 카운트
  const eventCounts: Record<string, number> = {};
  filtered.forEach((l) => {
    eventCounts[l.event] = (eventCounts[l.event] || 0) + 1;
  });

  // 일별 이벤트
  const dailyEvents: Record<string, Record<string, number>> = {};
  filtered.forEach((l) => {
    const day = l.created_at.slice(0, 10);
    if (!dailyEvents[day]) dailyEvents[day] = {};
    dailyEvents[day][l.event] = (dailyEvents[day][l.event] || 0) + 1;
  });

  // 시간대별 주문 (24시간)
  const hourlyOrders = new Array(24).fill(0);
  filtered
    .filter((l) => l.event === "order_complete")
    .forEach((l) => {
      const h = new Date(l.created_at).getHours();
      hourlyOrders[h]++;
    });

  // 매장별 QR 스캔
  const storeScans: Record<string, number> = {};
  filtered
    .filter((l) => l.event === "qr_scan" && l.store_code)
    .forEach((l) => {
      storeScans[l.store_code!] = (storeScans[l.store_code!] || 0) + 1;
    });

  // 주문유형 비율
  const orderTypes: Record<string, number> = { dine_in: 0, takeaway: 0 };
  filtered
    .filter((l) => l.event === "order_type")
    .forEach((l) => {
      const t = (l.data?.type as string) || "unknown";
      orderTypes[t] = (orderTypes[t] || 0) + 1;
    });

  // 인기 젤라또 맛
  const flavorCounts: Record<string, number> = {};
  filtered
    .filter((l) => l.event === "gelato_cart" && l.data?.flavors)
    .forEach((l) => {
      const flavors = l.data!.flavors as string[];
      flavors.forEach((f) => {
        flavorCounts[f] = (flavorCounts[f] || 0) + 1;
      });
    });

  // 인기 주류
  const drinkCounts: Record<string, number> = {};
  filtered
    .filter((l) => l.event === "drink_cart" && l.data?.itemName)
    .forEach((l) => {
      const name = l.data!.itemName as string;
      drinkCounts[name] = (drinkCounts[name] || 0) + 1;
    });

  // 주류 설명 클릭 순위
  const infoClicks: Record<string, number> = {};
  filtered
    .filter((l) => l.event === "drink_info" && l.data?.itemName)
    .forEach((l) => {
      const name = l.data!.itemName as string;
      infoClicks[name] = (infoClicks[name] || 0) + 1;
    });

  // 추천 페어링 전환율
  const pairingCount = filtered.filter((l) => l.event === "pairing_cart").length;

  // 퍼널 (방문→유형선택→장바구니→주문완료)
  const funnel = {
    qrScan: eventCounts["qr_scan"] || 0,
    orderType: eventCounts["order_type"] || 0,
    cartView: eventCounts["cart_view"] || 0,
    orderComplete: eventCounts["order_complete"] || 0,
  };

  // 디바이스 비율
  const devices: Record<string, number> = { iOS: 0, Android: 0, other: 0 };
  filtered.forEach((l) => {
    if (/iPhone|iPad/.test(l.user_agent)) devices.iOS++;
    else if (/Android/.test(l.user_agent)) devices.Android++;
    else devices.other++;
  });

  // 마진표 열람자 (전화번호 + IP + 시간)
  const marginLeads = filtered
    .filter((l) => l.event === "margin_lead" && l.data?.phone)
    .map((l) => ({
      phone: l.data!.phone as string,
      ip: l.ip,
      timestamp: l.created_at,
      userAgent: l.user_agent,
      device: /iPhone|iPad/.test(l.user_agent) ? "iOS" : /Android/.test(l.user_agent) ? "Android" : "PC",
    }));

  // 최근 이벤트 20건 (마진 열람은 전화번호·IP 포함)
  const recent = filtered.slice(0, 20).map((l) => ({
    event: l.event,
    storeCode: l.store_code,
    data: l.data,
    ip: l.ip,
    timestamp: l.created_at,
  }));

  return NextResponse.json({
    period: `${days}일`,
    totalEvents: filtered.length,
    eventCounts,
    dailyEvents,
    hourlyOrders,
    storeScans,
    orderTypes,
    flavorCounts,
    drinkCounts,
    infoClicks,
    pairingCount,
    funnel,
    devices,
    marginLeads,
    recent,
  });
}
