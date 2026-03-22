"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Trash2, ShoppingCart, Plus, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { stores, formatPrice } from "@/lib/order-data";
import type { OrderType } from "@/lib/order-types";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

// [PERF] Optimistic UI — 주문 완료 상태를 같은 컴포넌트에서 즉시 렌더링
// 페이지 전환 없이 상태만 변경하여 0ms 전환
interface OrderComplete {
  orderNumber: string;
  orderId: string;
  confirmed: boolean; // API 응답 확인 여부
  error?: string;
}

function CartContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeCode = params.storeCode as string;
  const store = stores.find((s) => s.code === storeCode);
  const { items, removeItem, updateItemQuantity, totalAmount, clearCart, memo, setMemo } = useCart();
  const orderType = (searchParams.get("type") as OrderType) || "dine_in";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [PERF] Optimistic UI 상태 — null이면 장바구니, 값이 있으면 영수증 화면
  const [orderComplete, setOrderComplete] = useState<OrderComplete | null>(null);
  const savedItemsRef = useRef(items); // 영수증 표시용 아이템 스냅샷

  if (!store) {
    router.push("/order");
    return null;
  }

  const isDemo = storeCode === "demo";

  const handleOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    // 데모 매장 — 실제 주문 안 들어감
    if (isDemo) {
      savedItemsRef.current = [...items];
      setOrderComplete({
        orderNumber: "DEMO",
        orderId: "demo",
        confirmed: true,
      });
      clearCart();
      return;
    }

    // 포장(즉시결제) 선택 시 PG 키 없으면 폴백 안내
    if (orderType === "takeaway" && !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      const confirmed = confirm(
        "현재 온라인 결제 시스템 준비 중입니다.\n카운터에서 결제로 주문하시겠습니까?"
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);

    // [PERF] 아이템 스냅샷 저장 (clearCart 후에도 표시용)
    savedItemsRef.current = [...items];

    const orderPayload = {
      storeId: store.id,
      storeCode: store.code,
      orderType,
      memo: memo || undefined,
      items: items.map((item) => ({
        type: item.type,
        itemName:
          item.type === "gelato"
            ? `${item.orderGroup} ${item.flavorCount}가지맛`
            : `${item.menuItem?.name} ${item.optionName}`,
        optionName:
          item.type === "gelato"
            ? (item.selectedFlavors?.map((f) => f.name).join(", ") || "")
            : (item.optionName || ""),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        selectedFlavors: item.selectedFlavors,
      })),
      totalAmount,
    };

    // [PERF] ★ Optimistic UI — 버튼 클릭 즉시 영수증 화면 표시
    // 주문번호는 API 응답 후 업데이트
    setOrderComplete({
      orderNumber: "...",
      orderId: "",
      confirmed: false,
    });
    // 뒤로가기 방지 — 주문 완료 후 뒤로가면 다시 주문되는 것 방지
    window.history.replaceState(null, "", window.location.href);
    clearCart();

    // [PERF] API 호출은 백그라운드에서 처리
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "주문 실패");
        }

        const data = await res.json();

        // [PERF] API 성공 → 주문번호 업데이트 (영수증 화면은 이미 표시됨)
        setOrderComplete({
          orderNumber: data.orderNumber,
          orderId: data.orderId,
          confirmed: true,
        });
        // 주문번호 저장 — 메뉴 페이지 + 공식홈페이지에서 배너로 표시
        try {
          sessionStorage.setItem("scoops_last_order", data.orderNumber);
          sessionStorage.setItem("scoops_last_store", storeCode);
        } catch {}
        return;
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        // 3회 실패 — 에러 표시하되 영수증 화면은 유지
        setOrderComplete((prev) => prev ? {
          ...prev,
          orderNumber: "---",
          error: "주문 전송에 실패했습니다. 카운터에 직접 말씀해주세요.",
        } : null);
      }
    }
  };

  // 뒤로가기 방지 — 주문 완료 상태에서 뒤로가면 새 주문 페이지로 이동
  useEffect(() => {
    if (!orderComplete) return;
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      // 새 주문 페이지로 이동
      router.replace(`/order/${storeCode}`);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [orderComplete, storeCode, router]);

  // ================================
  // [PERF] 주문 완료 화면 (인라인 렌더링 — 페이지 전환 없음)
  // ================================
  if (orderComplete) {
    const isDineIn = orderType === "dine_in";
    return (
      <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center">
        <main className="w-full max-w-[480px] flex-1 px-5 flex flex-col items-center justify-center">
          {/* 체크 아이콘 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-[#1B4332]/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 size={44} className="text-[#1B4332]" />
          </motion.div>

          <h1 className="text-xl font-bold text-[#2A2A2A] mb-2">{isDemo ? "체험 완료!" : "주문 완료!"}</h1>

          {/* 에러 메시지 */}
          {orderComplete.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 w-full text-center">
              <p className="text-sm text-red-600">{orderComplete.error}</p>
            </div>
          )}

          {/* 주문번호 */}
          {isDemo ? (
            <div className="bg-[#1B4332]/5 rounded-2xl px-6 py-5 text-center mb-6 w-full">
              <p className="text-sm font-bold text-[#1B4332] mb-2">데모 체험이 완료되었습니다</p>
              <p className="text-xs text-[#555] leading-relaxed">
                실제 매장에서는 QR코드를 스캔하면<br />이 화면에 주문번호가 표시되고<br />자동으로 영수증이 출력됩니다
              </p>
              <a
                href="/franchise"
                className="inline-block mt-4 px-6 py-2.5 bg-[#1B4332] text-white text-sm font-bold rounded-xl"
              >
                가맹 문의하기 →
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl px-8 py-6 text-center shadow-sm border border-[#EDE6DD]/60 mb-6 w-full">
              <p className="text-xs text-[#999] mb-1">주문번호</p>
              <p className="text-4xl font-black text-[#1B4332] tracking-wider">
                {orderComplete.orderNumber === "..." ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  orderComplete.orderNumber
                )}
              </p>
            </div>
          )}

          {/* 계좌이체 안내 — 포장 주문에서만 표시 */}
          {!isDineIn && <div className="bg-white rounded-2xl px-5 py-4 border border-[#EDE6DD]/60 mb-4 w-full">
            <p className="text-xs text-[#999] text-center mb-2">계좌이체 안내</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("1005803459120").then(() => {
                  const el = document.getElementById("copy-done");
                  if (el) { el.style.opacity = "1"; setTimeout(() => { el.style.opacity = "0"; }, 2000); }
                });
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] hover:bg-[#EDE6DD] transition-colors"
            >
              <div className="text-left">
                <p className="text-xs text-[#999]">우리은행 · 정석주</p>
                <p className="text-sm font-bold text-[#2A2A2A] tracking-wide">1005-803-459120</p>
              </div>
              <span className="text-xs text-[#A68B5B] font-medium">복사</span>
            </button>
            <p id="copy-done" className="text-xs text-[#1B4332] text-center mt-2 transition-opacity duration-300" style={{ opacity: 0 }}>
              ✓ 계좌번호가 복사되었습니다
            </p>
          </div>}

          {/* 안내 */}
          {isDineIn ? (
            <div className="bg-[#1B4332]/5 rounded-2xl px-5 py-4 text-center mb-8 w-full">
              <p className="text-sm text-[#1B4332] font-medium leading-relaxed">
                나가실 때 카운터에서
                <br />
                주문번호를 말씀해주세요
              </p>
            </div>
          ) : (
            <div className="bg-[#1B4332]/5 rounded-2xl px-5 py-4 text-center mb-8 w-full">
              <p className="text-sm text-[#1B4332] font-medium">
                결제가 완료되었습니다
              </p>
              <p className="text-xs text-[#555] mt-1">
                준비가 완료되면 카운터에서 픽업해주세요
              </p>
            </div>
          )}

          {/* 브랜드 링크 */}
          <div className="w-full bg-white rounded-2xl p-5 border border-[#EDE6DD]/60 mb-4">
            <p className="text-sm font-semibold text-[#2A2A2A] text-center mb-4">
              스쿱스젤라또가 궁금하신가요?
            </p>
            <div className="space-y-2">
              <Link
                href="/story"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] text-sm text-[#2A2A2A] font-medium hover:bg-[#EDE6DD] transition-colors"
              >
                브랜드 스토리 보기
                <ArrowRight size={16} className="text-[#999]" />
              </Link>
              <Link
                href="/franchise"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] text-sm text-[#2A2A2A] font-medium hover:bg-[#EDE6DD] transition-colors"
              >
                가맹 사업 알아보기
                <ArrowRight size={16} className="text-[#999]" />
              </Link>
            </div>
          </div>

          {/* 새 주문 */}
          <button
            onClick={() => {
              try { sessionStorage.removeItem("scoops_last_order"); sessionStorage.removeItem("scoops_last_store"); } catch {}
              router.replace(`/order/${storeCode}`);
            }}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[#1B4332] text-[#1B4332] text-sm font-bold mt-2 mb-10 hover:bg-[#1B4332]/5 transition-colors"
          >
            <RotateCcw size={16} />
            새 주문하기
          </button>
        </main>

        {/* PWA 설치 유도 배너 */}
        <PwaInstallBanner />
      </div>
    );
  }

  // ================================
  // 장바구니 화면 (기존)
  // ================================
  return (
    <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center">
      {/* 상단 */}
      <header className="w-full max-w-[480px] sticky top-0 z-40 bg-[#FDFBF8]/95 backdrop-blur-sm border-b border-[#EDE6DD]/50">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-[#2A2A2A]" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-[#999] tracking-widest">SCOOPS · {store.name}</p>
            <p className="text-[15px] font-bold text-[#2A2A2A]">주문 내역</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-[480px] flex-1 px-4 pb-40">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="mx-auto text-[#EDE6DD] mb-4" />
            <p className="text-[#999] text-sm mb-4">아직 담은 메뉴가 없어요</p>
            <Link
              href={`/order/${storeCode}`}
              className="text-[#1B4332] text-sm font-medium underline"
            >
              메뉴 보러가기
            </Link>
          </div>
        ) : (
          <>
            {/* 아이템 목록 */}
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-4 border border-[#EDE6DD]/60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {item.type === "gelato" ? (
                        <>
                          <p className="text-sm font-bold text-[#2A2A2A]">
                            젤라또·소르베또 {item.orderGroup} {item.flavorCount}가지맛
                          </p>
                          <p className="text-xs text-[#999] mt-1 truncate">
                            {item.selectedFlavors?.map((f) => f.name).join(", ")}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-[#2A2A2A]">
                            {item.menuItem?.name}
                          </p>
                          <p className="text-xs text-[#999] mt-1">
                            {item.optionName}
                          </p>
                        </>
                      )}
                      {/* 수량 변경 — 젤라또/주류 공통 */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) { removeItem(item.cartId); }
                              else { updateItemQuantity(item.cartId, item.quantity - 1); }
                            }}
                            className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center text-[#555] text-sm font-bold active:bg-[#EDE6DD]"
                          >
                            {item.quantity <= 1 ? "✕" : "−"}
                          </button>
                          <span className="text-sm font-bold text-[#2A2A2A] min-w-[24px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.cartId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center text-[#555] text-sm font-bold active:bg-[#EDE6DD]"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold text-[#1B4332]">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="w-9 h-9 flex items-center justify-center text-[#BBB] hover:text-red-400 transition-colors ml-2"
                      aria-label="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 메뉴 더 추가 */}
            <Link
              href={`/order/${storeCode}`}
              className="flex items-center justify-center gap-2 w-full py-3 mt-3 rounded-2xl border border-dashed border-[#EDE6DD] text-[#999] text-sm"
            >
              <Plus size={16} />
              메뉴 더 추가하기
            </Link>

            {/* 요청사항 */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-[#2A2A2A] block mb-2">
                요청사항 <span className="font-normal text-[#BBB]">(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예) 젤라또 따로 담아주세요"
                maxLength={200}
                className="w-full bg-white border border-[#EDE6DD] rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] placeholder:text-[#BBB] resize-none h-20 focus:outline-none focus:border-[#1B4332]/30"
              />
            </div>

            {/* 주문 유형 표시 */}
            <div className="mt-6 p-4 bg-[#1B4332]/5 rounded-2xl">
              <p className="text-sm font-semibold text-[#1B4332]">
                {orderType === "dine_in" ? "매장식사 (후불)" : "포장"}
              </p>
              <p className="text-xs text-[#555] mt-1">
                {orderType === "dine_in"
                  ? "나가실 때 카운터에서 결제해주세요"
                  : "준비되면 카운터에서 픽업해주세요"}
              </p>
            </div>
          </>
        )}
      </main>

      {/* 하단 주문/결제 버튼 */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
          <div className="w-full max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom,20px),20px)] bg-[#FDFBF8] border-t border-[#EDE6DD]/50">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[#555]">합계</span>
              <span className="text-lg font-bold text-[#2A2A2A]">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all mb-2 ${
                isSubmitting
                  ? "bg-[#EDE6DD] text-[#BBB] cursor-not-allowed"
                  : "bg-[#1B4332] text-white active:scale-[0.98] shadow-md"
              }`}
            >
              {isSubmitting
                ? "주문 처리 중..."
                : orderType === "dine_in"
                ? `매장식사 - 주문 넣기`
                : `포장 - ${formatPrice(totalAmount)} 결제하기`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#FDFBF8] flex items-center justify-center">
          <div className="text-[#999] text-sm">로딩 중...</div>
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
