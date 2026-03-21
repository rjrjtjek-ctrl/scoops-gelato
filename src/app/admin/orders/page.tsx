"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  X,
  Clock,
  ChefHat,
  PackageCheck,
  CreditCard,
  History,
  QrCode,
  Volume2,
  VolumeX,
  RefreshCw,
  Printer,
  Trash2,
  Smartphone,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";
import { stores, formatPrice } from "@/lib/order-data";
import type { Order, OrderStatus } from "@/lib/order-types";
import { createClient } from "@supabase/supabase-js";

// Supabase Realtime 클라이언트 (브라우저에서만 생성)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "신규",
  confirmed: "확인됨",
  preparing: "준비중",
  ready: "준비완료",
  completed: "완료",
  cancelled: "거절됨",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-red-500",
  confirmed: "bg-blue-500",
  preparing: "bg-yellow-500",
  ready: "bg-green-500",
  completed: "bg-gray-400",
  cancelled: "bg-gray-300",
};

type TabFilter = "pending" | "active" | "completed";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStore, setSelectedStore] = useState(stores.find((s) => s.isActive)?.id || "");
  const [activeTab, setActiveTab] = useState<TabFilter>("pending");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);
  const [pwaStats, setPwaStats] = useState<{ total: number; todayCount: number; recent: { timestamp: string; device: string }[] } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printQueue, setPrintQueue] = useState<{ order: Order; copy: "kitchen" | "customer" }[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const prevOrderCount = useRef(0);
  const prevOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true); // [FIX1] 첫 로딩 구분용
  const printedIds = useRef<Set<string>>(new Set()); // [FIX1] 이미 인쇄한 주문 추적
  const isPrinting = useRef(false); // [FIX3] 인쇄 중복 방지 락
  const isFetching = useRef(false); // [PERF] 폴링 중복 방지 — 이전 fetch 끝나기 전 다음 fetch 시작 차단
  const printWinRef = useRef<Window | null>(null); // [PERF] 팝업 재사용 — 매번 새 팝업 열지 않음
  const ordersRef = useRef<Order[]>([]); // [PERF] 변경 감지용 — setOrders 불필요한 호출 방지
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ============================================
  // 영수증 인쇄 — 주방용 + 손님용을 CSS page-break로 분리
  // 팝업 1개 + print() 1번 = 프린터가 자동 절단하여 2장 출력
  // ============================================
  const buildReceiptPage = useCallback((order: Order, copyLabel: string, storeName: string, timeStr: string) => {
    const esc = (s: string | undefined | null) =>
      String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const itemsHtml = (order.items || []).map((item) => {
      const qty = (item.quantity || 1) > 1 ? ` x${item.quantity}` : "";
      const price = typeof item.unitPrice === "number" ? item.unitPrice.toLocaleString() : "0";
      return `
        <tr>
          <td style="text-align:left;padding:2px 0;">${esc(item.itemName)}${qty}</td>
          <td style="text-align:right;padding:2px 0;">${price}원</td>
        </tr>
        ${item.optionName ? `<tr><td colspan="2" style="font-size:11px;color:#000;padding:0 0 4px 8px;">→ ${esc(item.optionName)}</td></tr>` : ""}
      `;
    }).join("");

    return `<div class="receipt">
      <div class="center">
        <p class="bold" style="font-size:15px;">SCOOPS GELATERIA</p>
        <p style="font-size:12px;color:#000;">${storeName}</p>
        <p style="font-size:11px;font-weight:bold;margin-top:4px;border:1px solid #000;display:inline-block;padding:1px 8px;">[${copyLabel}]</p>
      </div>
      <hr class="divider-thick">
      <div class="center">
        <p style="font-size:12px;color:#000;">주문번호</p>
        <p class="big">${order.orderNumber}</p>
      </div>
      <hr class="divider">
      <table>
        <tr><td style="font-size:11px;color:#000;">주문유형</td><td style="text-align:right;font-weight:bold;">${order.orderType === "dine_in" ? "매장식사 (후불)" : "포장"}</td></tr>
        <tr><td style="font-size:11px;color:#000;">주문시간</td><td style="text-align:right;">${timeStr}</td></tr>
      </table>
      <hr class="divider">
      <table>${itemsHtml}</table>
      <hr class="divider-thick">
      <table><tr class="total-row"><td>합계</td><td style="text-align:right;">${order.totalAmount.toLocaleString()}원</td></tr></table>
      ${order.memo ? `<div class="memo" style="max-height:60px;overflow:hidden;">요청사항: ${esc(order.memo).slice(0, 100)}</div>` : ""}
      <hr class="divider">
      <div class="center footer">
        <p>스쿱스 젤라떼리아</p>
        <p>Tel. 1811-0259</p>
        <p style="margin-top:4px;">QR 모바일 주문</p>
      </div>
    </div>`;
  }, []);

  const buildCombinedReceiptHtml = useCallback((order: Order) => {
    const storeName = stores.find((s) => s.id === order.storeId)?.name || "스쿱스젤라또";
    const now = new Date(order.createdAt);
    const timeStr = now.toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

    const kitchenPage = buildReceiptPage(order, "주방용", storeName, timeStr);
    const customerPage = buildReceiptPage(order, "손님용", storeName, timeStr);

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      @page { margin: 0; padding: 0; }
      @media print {
        html, body { width: 72mm; margin: 0; padding: 0; }
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; width: 72mm; max-width: 72mm; font-size: 13px; color: #000; }
      .receipt { padding: 3mm 4mm; page-break-after: always; }
      .receipt:last-child { page-break-after: auto; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .big { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
      .divider { border: none; border-top: 1px dashed #000; margin: 8px 0; }
      .divider-thick { border: none; border-top: 2px solid #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      .total-row td { font-size: 16px; font-weight: 900; padding: 6px 0; }
      .memo { background: #f5f5f5; padding: 6px 8px; border-radius: 4px; font-size: 12px; margin-top: 6px; }
      .footer { font-size: 10px; color: #000; margin-top: 12px; }
    </style></head><body>
      ${kitchenPage}
      ${customerPage}
    </body></html>`;
  }, [buildReceiptPage]);

  // popup 방식 인쇄 — 별도 창에서 print()하므로 메인 페이지 블로킹 없음
  // [PERF] 팝업 재사용 + print() 1번으로 주방용+손님용 2장 출력
  // Win7/Chrome 109에서 window.open()이 느리므로 팝업을 닫지 않고 재사용
  const printViaPopup = useCallback((html: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      // [PERF] 기존 팝업이 살아있으면 재사용, 없으면 새로 열기
      let printWin = printWinRef.current;
      if (!printWin || printWin.closed) {
        printWin = window.open("", "scoops_receipt", "width=320,height=600");
        printWinRef.current = printWin;
      }
      if (!printWin || printWin.closed) {
        setPrintError("⚠️ 팝업이 차단되었습니다! 주소창의 팝업 차단 아이콘을 클릭하여 허용해주세요.");
        resolve();
        return;
      }
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();

      let printed = false;
      const doPrint = () => {
        if (printed) return;
        printed = true;
        try { printWin!.print(); } catch {}
        // [PERF] 팝업을 닫지 않고 재사용 — Win7에서 window.open() 비용 절약
        setTimeout(() => resolve(), 50);
      };

      // [FIX6] onload + setTimeout 중 먼저 실행된 것만 호출
      printWin.onload = () => doPrint();
      setTimeout(doPrint, 60);
    });
  }, []);

  // 인쇄 큐 — 주문 1건 = 큐 아이템 1개 (주방용+손님용 합본)
  const processNextPrint = useCallback(() => {
    setPrintQueue((queue) => {
      if (queue.length === 0 || isPrinting.current) return queue;
      isPrinting.current = true;
      const item = queue[0];
      const remaining = queue.slice(1);

      const receiptHtml = buildCombinedReceiptHtml(item.order);
      printViaPopup(receiptHtml).then(() => {
        isPrinting.current = false;
        printedIds.current.add(item.order.id);
        if (remaining.length > 0) {
          processNextPrint();
        }
      });

      return remaining;
    });
  }, [buildCombinedReceiptHtml, printViaPopup]);

  // 인쇄 큐에 추가 — 주문 1건 = 1개 아이템 (2장은 CSS page-break로 분리)
  const MAX_PRINT_QUEUE = 30;
  const printReceipt = useCallback((ord: Order) => {
    setPrintQueue((prev) => {
      if (prev.length + 1 >= MAX_PRINT_QUEUE) {
        setPrintError(`⚠️ 인쇄 대기열이 ${MAX_PRINT_QUEUE}건을 초과했습니다. 프린터 상태를 확인하세요.`);
        return prev;
      }
      return [...prev, { order: ord, copy: "kitchen" as const }];
    });
    // [PERF] setTimeout 제거 — 즉시 실행으로 1틱 지연 제거
    processNextPrint();
  }, [processNextPrint]);

  // 수동 재인쇄
  const manualPrint = useCallback((ord: Order) => {
    setPrintQueue((prev) => [...prev, { order: ord, copy: "kitchen" as const }]);
    processNextPrint();
  }, [processNextPrint]);

  const fetchOrders = useCallback(async () => {
    if (!selectedStore) return;
    // [PERF] 이전 fetch가 아직 진행 중이면 건너뜀 — 요청 쌓임 방지
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      // [PERF] today=true — 오늘 주문만 PostgREST 직접 쿼리 (RPC JOIN보다 빠름)
      const res = await fetch(`/api/order?storeId=${selectedStore}&today=true`);
      if (res.ok) {
        const data = await res.json();
        const newOrders: Order[] = data.orders || [];

        const pendingCount = newOrders.filter((o: Order) => o.status === "pending").length;
        const currentIds = new Set(newOrders.map((o: Order) => o.id));

        // [FIX1] 첫 로딩 시에는 기존 주문 ID만 기록하고 인쇄하지 않음
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          prevOrderIds.current = currentIds;
          // 기존 pending 주문들은 이미 인쇄된 것으로 간주
          newOrders.forEach((o: Order) => {
            if (o.status !== "pending") printedIds.current.add(o.id);
          });
          prevOrderCount.current = pendingCount;
          ordersRef.current = newOrders;
          setOrders(newOrders);
          return;
        }

        // 새로 추가된 주문 찾기
        const newOrderItems = newOrders.filter(
          (o: Order) => o.status === "pending" && !prevOrderIds.current.has(o.id)
        );

        // [FIX4] 네트워크 복구 시 밀린 주문이 3건 이상이면 최신 3건만 자동 인쇄
        const MAX_AUTO_PRINT = 3;
        const ordersToPrint = newOrderItems.length > MAX_AUTO_PRINT
          ? newOrderItems.slice(-MAX_AUTO_PRINT) // 최신 3건만
          : newOrderItems;

        if (ordersToPrint.length > 0) {
          // 알림 소리
          if (soundEnabled) {
            playNotificationSound();
            if (Notification.permission === "granted") {
              new Notification(`새 주문 ${newOrderItems.length}건!`, {
                body: `주문번호: ${newOrderItems.map(o => o.orderNumber).join(", ")}`,
              });
            }
          }

          // [FIX4] 밀린 주문이 많으면 경고
          if (newOrderItems.length > MAX_AUTO_PRINT) {
            setPrintError(`⚠️ 밀린 주문 ${newOrderItems.length}건 중 최신 ${MAX_AUTO_PRINT}건만 자동 인쇄합니다. 나머지는 수동 인쇄해주세요.`);
          }

          // 자동 영수증 인쇄 + 자동 주문 확인
          if (autoPrint) {
            ordersToPrint.forEach((order: Order) => {
              // [FIX1] 이미 인쇄한 주문은 건너뜀
              if (!printedIds.current.has(order.id)) {
                printReceipt(order);
              }
              // 자동으로 주문 확인 처리 (fire-and-forget)
              fetch("/api/order", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id, status: "confirmed" }),
              }).catch(() => {});
            });
          }
        }

        prevOrderIds.current = currentIds;
        prevOrderCount.current = pendingCount;

        // [PERF] 주문 데이터가 실제로 바뀌었을 때만 React state 업데이트 (Win7 POS 리렌더링 절감)
        const prev = ordersRef.current;
        const changed = newOrders.length !== prev.length ||
          newOrders.some((o, i) => o.id !== prev[i]?.id || o.status !== prev[i]?.status || o.updatedAt !== prev[i]?.updatedAt);
        if (changed) {
          ordersRef.current = newOrders;
          setOrders(newOrders);
        }
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      isFetching.current = false;
    }
  }, [selectedStore, soundEnabled, autoPrint, printReceipt]);

  // [PERF] 수동 새로고침 — 스피너 애니메이션 표시용 (폴링과 분리)
  const manualRefresh = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
    setLoading(false);
  }, [fetchOrders]);

  // ============================================
  // Supabase Realtime 구독 — 새 주문 INSERT 시 즉시 감지
  // WebSocket으로 push 알림 → 폴링 대기 시간 제거
  // ============================================
  useEffect(() => {
    if (!supabase || !selectedStore) return;

    const channel = supabase
      .channel(`orders-${selectedStore}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${selectedStore}`,
        },
        () => {
          // 새 주문 INSERT 감지 → 즉시 전체 주문 목록 fetch
          // payload를 직접 쓰지 않고 fetchOrders()로 items 포함 전체 데이터를 가져옴
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${selectedStore}`,
        },
        () => {
          // 주문 상태 변경 시에도 즉시 반영
          fetchOrders();
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [selectedStore, fetchOrders]);

  // [PERF] Fallback 폴링 — Realtime 연결 시 5초, 미연결 시 100ms (기존 속도 유지)
  useEffect(() => {
    let active = true;
    const poll = async () => {
      await fetchOrders();
      if (active) setTimeout(poll, realtimeConnected ? 5000 : 100);
    };
    poll();

    // 화면이 다시 보일 때 (절전모드 해제, 탭 복귀) 즉시 새 주문 확인
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOrders, realtimeConnected]);

  // [PERF] 매장 변경 시 상태 리셋
  useEffect(() => {
    isFirstLoad.current = true;
    prevOrderIds.current = new Set();
    ordersRef.current = [];
  }, [selectedStore]);

  // 관리자 기기 표시 + 브라우저 알림 권한
  useEffect(() => {
    // 이 기기를 관리자로 표시 (추적 제외용)
    document.cookie = "scoops_admin=true; path=/; max-age=31536000; SameSite=Lax";

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // PWA 설치 통계
  useEffect(() => {
    fetch("/api/pwa-install")
      .then((r) => r.json())
      .then((d) => setPwaStats(d))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/pwa-install").then((r) => r.json()).then((d) => setPwaStats(d)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkpSQi4aDgH58fH2AgoWHiYuLi4qIhYJ/fHp5eXp8f4KFh4mKioqJh4WCf3x6eXl6fH+ChoiKi4uKiYeFgn98enl5ent+goWHiYqLi4qIhYJ/fHp5eXp8f4KFh4mKi4uKiYeFgn98enl5ent+goWHiYqLi4qIhYJ/fHp5eXp8f4KFiIqLi4uKiIWCf3x6eXl6e36ChoiKi4uLioiFgn98enl5enp+goWIiouLi4mIhYJ/fHp5eXp8f4KFiIqLi4uKiIWCf3x6eQ==");
      }
      audioRef.current.play().catch(() => {});
    } catch {}
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders();
    } catch (e) {
      console.error("Failed to update order:", e);
    }
  };

  const updatePayment = async (orderId: string) => {
    try {
      await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: "paid", paymentMethod: "card_offline" }),
      });
      fetchOrders();
    } catch (e) {
      console.error("Failed to update payment:", e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/order?orderId=${orderId}`, { method: "DELETE" });
      fetchOrders();
    } catch (e) {
      console.error("Failed to delete order:", e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "pending") return o.status === "pending";
    if (activeTab === "active") return ["confirmed", "preparing", "ready"].includes(o.status);
    return ["completed", "cancelled"].includes(o.status);
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount = orders.filter((o) =>
    ["confirmed", "preparing", "ready"].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) =>
    ["completed", "cancelled"].includes(o.status)
  ).length;

  const activeStores = stores.filter((s) => s.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 text-sm hover:text-gray-700">
              ← 관리자
            </Link>
            <h1 className="text-lg font-bold text-gray-900">주문 관리</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Realtime 연결 상태 표시 */}
            <span
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                realtimeConnected
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}
              title={realtimeConnected ? "실시간 연결됨 (WebSocket)" : "실시간 미연결 (폴링 모드)"}
            >
              {realtimeConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {realtimeConnected ? "실시간" : "폴링"}
            </span>
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                autoPrint
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-50 text-gray-400 border border-gray-200"
              }`}
              title={autoPrint ? "자동 인쇄 켜짐" : "자동 인쇄 꺼짐"}
            >
              <Printer size={14} />
              {autoPrint ? "자동인쇄 ON" : "자동인쇄 OFF"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title={soundEnabled ? "알림 소리 끄기" : "알림 소리 켜기"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-gray-400" />}
            </button>
            <Link href="/admin/orders/analytics" className="p-2 rounded-lg hover:bg-gray-100" title="분석">
              <BarChart3 size={18} />
            </Link>
            <Link href="/admin/orders/history" className="p-2 rounded-lg hover:bg-gray-100" title="주문 이력">
              <History size={18} />
            </Link>
            <Link href="/admin/qr" className="p-2 rounded-lg hover:bg-gray-100" title="QR 관리">
              <QrCode size={18} />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 매장 선택 */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {activeStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={manualRefresh}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="새로고침"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* [FIX2/7] 인쇄 오류 알림 배너 */}
        {printError && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{printError}</p>
            </div>
            <button
              onClick={() => setPrintError(null)}
              className="text-yellow-600 hover:text-yellow-800 ml-2 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* [FIX3] 인쇄 대기 큐 표시 */}
        {printQueue.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <Printer size={16} className="text-blue-600 animate-pulse" />
            <p className="text-sm text-blue-700">인쇄 대기 중: {printQueue.length}건</p>
          </div>
        )}

        {/* PWA 설치 통계 */}
        {pwaStats && (
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-emerald-600" />
              <span className="text-sm text-gray-600">홈화면 추가</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-gray-400">오늘</span>
                <span className="text-sm font-bold text-gray-900 ml-1">{pwaStats.todayCount}건</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">누적</span>
                <span className="text-sm font-bold text-emerald-600 ml-1">{pwaStats.total}건</span>
              </div>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "pending"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            신규 ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "active"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            진행중 ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "completed"
                ? "bg-gray-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            완료 ({completedCount})
          </button>
        </div>

        {/* 주문 목록 */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>주문이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-900">{order.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs text-white font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.orderType === "dine_in" ? "매장식사" : "포장"}
                      {" · "}
                      {order.paymentStatus === "paid" ? "결제완료" : "미결제"}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                {/* 아이템 */}
                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx}>
                      {item.itemName}
                      {item.optionName ? ` — ${item.optionName}` : ""}
                      {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                    </p>
                  ))}
                  {order.memo && (
                    <p className="text-xs text-orange-500 mt-1">📝 {order.memo}</p>
                  )}
                </div>

                {/* 시간 */}
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(order.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* 액션 버튼 */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => manualPrint(order)}
                    className="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg text-sm flex items-center gap-1 border border-gray-200 hover:bg-gray-100"
                    title="영수증 인쇄"
                  >
                    <Printer size={14} /> 인쇄
                  </button>
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "confirmed")}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> 확인
                      </button>
                      <button
                        onClick={() => setShowRejectConfirm(order.id)}
                        className="py-2 px-4 bg-gray-100 text-gray-500 rounded-lg text-sm"
                      >
                        거절
                      </button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(order.id, "preparing")}
                      className="flex-1 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <ChefHat size={14} /> 준비 시작
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateStatus(order.id, "ready")}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <PackageCheck size={14} /> 준비 완료
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="flex-1 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium"
                    >
                      완료 처리
                    </button>
                  )}
                  {order.paymentStatus === "unpaid" &&
                    order.status !== "cancelled" &&
                    order.status !== "pending" && (
                      <button
                        onClick={() => updatePayment(order.id)}
                        className="py-2 px-4 bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        <CreditCard size={14} /> 결제 처리
                      </button>
                    )}
                  {(order.status === "completed" || order.status === "cancelled") && (
                    <button
                      onClick={() => setShowDeleteConfirm(order.id)}
                      className="py-2 px-3 bg-red-50 text-red-500 rounded-lg text-sm flex items-center gap-1 border border-red-200 hover:bg-red-100"
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 거절 확인 모달 */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <p className="text-sm font-semibold text-gray-900 mb-2">정말 거절하시겠습니까?</p>
            <p className="text-xs text-gray-500 mb-4">거절된 주문은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  updateStatus(showRejectConfirm, "cancelled");
                  setShowRejectConfirm(null);
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                거절 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <p className="text-sm font-semibold text-gray-900 mb-2">주문을 삭제하시겠습니까?</p>
            <p className="text-xs text-gray-500 mb-4">삭제된 주문은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  deleteOrder(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
