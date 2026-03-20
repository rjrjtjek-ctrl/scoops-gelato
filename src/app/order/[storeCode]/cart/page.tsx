"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trash2, ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { stores, formatPrice } from "@/lib/order-data";
import type { OrderType } from "@/lib/order-types";

function CartContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeCode = params.storeCode as string;
  const store = stores.find((s) => s.code === storeCode);
  const { items, removeItem, totalAmount, clearCart, memo, setMemo } = useCart();
  const orderType = (searchParams.get("type") as OrderType) || "dine_in";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!store) {
    router.push("/order");
    return null;
  }

  const handleOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    // 포장(즉시결제) 선택 시 PG 키 없으면 폴백 안내
    if (orderType === "takeaway" && !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      const confirmed = confirm(
        "현재 온라인 결제 시스템 준비 중입니다.\n카운터에서 결제로 주문하시겠습니까?"
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);

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

    // 최대 3회 자동 재시도 (네트워크 순간 끊김 대비)
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

        // 주문 완료 페이지로 이동 (clearCart보다 먼저 — 이동 실패 시 장바구니 보존)
        const completeUrl = `/order/${storeCode}/complete?orderId=${data.orderId}&orderNumber=${data.orderNumber}&type=${orderType}`;
        router.push(completeUrl);
        // router.push 성공 후 장바구니 비우기
        clearCart();
        return; // 성공 시 함수 종료
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          // 1초 대기 후 재시도
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        // 3회 모두 실패 — 장바구니는 유지됨 (sessionStorage에 저장되어 있음)
        alert("주문 전송에 실패했습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.\n(장바구니는 유지됩니다)");
      }
    }
    setIsSubmitting(false);
  };

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
          <h1 className="flex-1 text-center text-[15px] font-bold text-[#2A2A2A]">
            주문 내역
          </h1>
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
                            {item.optionName} × {item.quantity}
                          </p>
                        </>
                      )}
                      <p className="text-sm font-bold text-[#1B4332] mt-2">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="w-9 h-9 flex items-center justify-center text-[#BBB] hover:text-red-400 transition-colors"
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
