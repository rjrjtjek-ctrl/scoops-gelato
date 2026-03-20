import { NextRequest, NextResponse } from "next/server";
import { getOrderDataSource } from "@/lib/supabase-order";

const ds = getOrderDataSource();

// ============================================
// Rate Limiting — 같은 IP에서 1분 내 최대 5건 주문
// ============================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1분
const RATE_LIMIT_MAX = 5; // 1분 내 최대 5건

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// POST: 새 주문 생성
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "주문이 너무 빈번합니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const body = await req.json();
    const { storeId, storeCode, orderType, items, totalAmount, memo, customerPhone } = body;

    // 유효성 검사
    if (!storeId || !orderType || !items || items.length === 0) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
    }

    if (!["dine_in", "takeaway"].includes(orderType)) {
      return NextResponse.json({ error: "잘못된 주문 유형입니다" }, { status: 400 });
    }

    // 서버에서 금액 재계산 (클라이언트 전달 금액 신뢰하지 않음)
    let serverTotal = 0;
    for (const item of items) {
      if (item.unitPrice < 0 || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: "잘못된 수량 또는 가격입니다" }, { status: 400 });
      }
      serverTotal += item.unitPrice * item.quantity;
    }

    // 클라이언트 총액과 서버 계산 총액 비교 (젤라또는 quantity=1이므로 subtotal 기준)
    const clientItemTotal = items.reduce(
      (sum: number, item: { subtotal: number }) => sum + item.subtotal,
      0
    );

    if (Math.abs(clientItemTotal - serverTotal) > 1) {
      // 소수점 오차 허용
      return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });
    }

    // 주문 생성 (Supabase RPC 사용 시 주문번호도 DB에서 자동 생성)
    const order = await ds.createOrder({
      storeId,
      orderNumber: "", // RPC에서 자동 생성, 인메모리에서는 아래에서 설정
      orderType,
      status: "pending",
      paymentStatus: orderType === "dine_in" ? "unpaid" : "unpaid",
      paymentMethod: null,
      totalAmount: serverTotal,
      memo: memo ? String(memo).slice(0, 200) : undefined,
      customerPhone: customerPhone || undefined,
      items: items.map(
        (
          item: {
            itemName: string;
            optionName: string;
            quantity: number;
            unitPrice: number;
            subtotal: number;
            selectedFlavors?: { id: string; name: string }[];
          },
          idx: number
        ) => ({
          id: `oi_${Date.now()}_${idx}`,
          orderId: "",
          itemName: String(item.itemName || "").slice(0, 100),
          optionName: String(item.optionName || "").slice(0, 200),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          selectedFlavors: item.selectedFlavors,
        })
      ),
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "주문 생성에 실패했습니다" }, { status: 500 });
  }
}

// GET: 주문 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    if (orderId) {
      const order = await ds.getOrder(orderId);
      if (!order) {
        return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    if (storeId) {
      const orders = await ds.getOrders(
        storeId,
        status as "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined
      );
      // [PERF] 캐싱 방지 — 폴링이 항상 최신 데이터를 가져오도록
      return NextResponse.json({ orders }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "CDN-Cache-Control": "no-store" },
      });
    }

    return NextResponse.json({ error: "orderId 또는 storeId가 필요합니다" }, { status: 400 });
  } catch (error) {
    console.error("Order fetch failed:", error);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }
}

// PATCH: 주문 상태 변경 (관리자용)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, paymentStatus, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId가 필요합니다" }, { status: 400 });
    }

    if (status) {
      const validStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "잘못된 상태값입니다" }, { status: 400 });
      }
      await ds.updateOrderStatus(orderId, status);
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["unpaid", "paid", "refunded"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "잘못된 결제 상태값입니다" }, { status: 400 });
      }
      await ds.updatePaymentStatus(orderId, paymentStatus, paymentMethod);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order update failed:", error);
    return NextResponse.json({ error: "주문 업데이트에 실패했습니다" }, { status: 500 });
  }
}

// DELETE: 주문 삭제 (관리자용)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId가 필요합니다" }, { status: 400 });
    }

    // Supabase 설정 시 DB에서 삭제
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)) {
      const { supabaseDelete } = await import("@/lib/supabase-client");
      await supabaseDelete("order_items", `order_id=eq.${orderId}`);
      await supabaseDelete("orders", `id=eq.${orderId}`);
      return NextResponse.json({ success: true });
    }

    // 인메모리 폴백
    const store = (globalThis as Record<string, unknown>).__orderStore as Array<{ id: string }>;
    if (store) {
      const idx = store.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        store.splice(idx, 1);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  } catch (error) {
    console.error("Order delete failed:", error);
    return NextResponse.json({ error: "주문 삭제에 실패했습니다" }, { status: 500 });
  }
}
