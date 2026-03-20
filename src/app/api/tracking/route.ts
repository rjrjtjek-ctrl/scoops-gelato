import { NextRequest, NextResponse } from "next/server";

// ============================================
// 추적 이벤트 로그 (Supabase 전환 전 인메모리)
// ============================================
export interface TrackingEvent {
  id: string;
  event: string; // 이벤트 타입
  storeCode?: string;
  data?: Record<string, unknown>;
  userAgent: string;
  timestamp: string;
}

const trackingLogs: TrackingEvent[] =
  ((globalThis as Record<string, unknown>).__trackingLogs as TrackingEvent[]) || [];
if (!(globalThis as Record<string, unknown>).__trackingLogs) {
  (globalThis as Record<string, unknown>).__trackingLogs = trackingLogs;
}

// 이벤트 타입 목록
// qr_scan        — QR 스캔 (매장 페이지 진입)
// order_type     — 매장식사/포장 선택
// gelato_select  — 젤라또 맛 수 선택
// gelato_cart    — 젤라또 장바구니 추가
// drink_view     — 주류 탭 열기
// drink_item     — 주류 아이템 클릭
// drink_cart     — 주류 장바구니 추가
// drink_info     — 주류 설명 팝업 열기
// pairing_cart   — 추천 페어링으로 장바구니 추가
// age_confirm    — 연령 확인 완료
// cart_view      — 장바구니 페이지 진입
// order_complete — 주문 완료
// pwa_banner     — PWA 배너 표시
// pwa_install    — PWA 설치
// pwa_dismiss    — PWA 다음에 하기
// link_homepage  — 홈페이지 링크 클릭
// link_instagram — 인스타 링크 클릭
// link_brand     — 주문완료 후 브랜드 링크 클릭

// POST: 이벤트 기록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, storeCode, data } = body;

    if (!event) {
      return NextResponse.json({ error: "event 필수" }, { status: 400 });
    }

    const log: TrackingEvent = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      event,
      storeCode: storeCode || undefined,
      data: data || undefined,
      userAgent: req.headers.get("user-agent") || "",
      timestamp: new Date().toISOString(),
    };

    trackingLogs.push(log);

    // 메모리 관리: 최대 10000건 유지
    if (trackingLogs.length > 10000) {
      trackingLogs.splice(0, trackingLogs.length - 10000);
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

  const filtered = trackingLogs.filter((l) => l.timestamp >= cutoffStr);

  // 이벤트별 카운트
  const eventCounts: Record<string, number> = {};
  filtered.forEach((l) => {
    eventCounts[l.event] = (eventCounts[l.event] || 0) + 1;
  });

  // 일별 이벤트
  const dailyEvents: Record<string, Record<string, number>> = {};
  filtered.forEach((l) => {
    const day = l.timestamp.slice(0, 10);
    if (!dailyEvents[day]) dailyEvents[day] = {};
    dailyEvents[day][l.event] = (dailyEvents[day][l.event] || 0) + 1;
  });

  // 시간대별 주문 (24시간)
  const hourlyOrders = new Array(24).fill(0);
  filtered
    .filter((l) => l.event === "order_complete")
    .forEach((l) => {
      const h = new Date(l.timestamp).getHours();
      hourlyOrders[h]++;
    });

  // 매장별 QR 스캔
  const storeScans: Record<string, number> = {};
  filtered
    .filter((l) => l.event === "qr_scan" && l.storeCode)
    .forEach((l) => {
      storeScans[l.storeCode!] = (storeScans[l.storeCode!] || 0) + 1;
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
    if (/iPhone|iPad/.test(l.userAgent)) devices.iOS++;
    else if (/Android/.test(l.userAgent)) devices.Android++;
    else devices.other++;
  });

  // 최근 이벤트 20건
  const recent = filtered.slice(-20).reverse().map((l) => ({
    event: l.event,
    storeCode: l.storeCode,
    data: l.data,
    timestamp: l.timestamp,
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
    recent,
  });
}
