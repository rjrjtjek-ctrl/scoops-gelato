"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  X,
  Check,
  Wine,
  Info,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { track } from "@/lib/tracking";
import {
  stores,
  gelatoPrices,
  menuItems,
  gelatoPrices as allGelatoPrices,
  getAllFlavors,
  getItemsByCategory,
  getPricesForItem,
  formatPrice,
  getDrinkDescription,
} from "@/lib/order-data";
import type { CartItem, MenuItem, GelatoPrice } from "@/lib/order-types";

// ============================================
// 메인 페이지 컴포넌트
// ============================================
export default function StoreMenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeCode = params.storeCode as string;
  const store = stores.find((s) => s.code === storeCode);

  const { items: cartItems, addItem, totalCount, totalAmount, setStoreCode } = useCart();

  // 매장 전환 감지 — 다른 매장 장바구니 자동 초기화
  useEffect(() => {
    if (storeCode) setStoreCode(storeCode);
  }, [storeCode, setStoreCode]);

  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [activeDrinkTab, setActiveDrinkTab] = useState<"cat3" | "cat4" | "cat5" | null>(null);
  const [pendingDrinkTab, setPendingDrinkTab] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const drinkSectionRef = useRef<HTMLDivElement | null>(null);

  // 토스트 자동 사라짐
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // 주류 서브탭 클릭 → 토글 (연령 확인 없이 메뉴 바로 보여줌)
  const handleDrinkTabClick = (tabId: "cat3" | "cat4" | "cat5") => {
    if (activeDrinkTab === tabId) {
      setActiveDrinkTab(null);
      return;
    }
    setActiveDrinkTab(tabId);
  };

  // 주류 장바구니 추가 시 연령 확인
  const pendingCartItem = useRef<CartItem | null>(null);

  const handleAddToCart = useCallback((item: CartItem) => {
    // 주류인데 연령 미확인이면 → 모달 띄우고 대기
    if (item.type === "drink" && !ageVerified) {
      pendingCartItem.current = item;
      setShowAgeModal(true);
      return;
    }
    addItem(item);
    setToast("장바구니에 추가되었습니다");
    // 추적
    if (item.type === "gelato") {
      track("gelato_cart", storeCode, { flavors: item.selectedFlavors?.map(f => f.name), count: item.flavorCount });
    } else {
      track("drink_cart", storeCode, { itemName: item.menuItem?.name, option: item.optionName });
    }
  }, [ageVerified, addItem, storeCode]);

  const handleAgeConfirm = () => {
    setAgeVerified(true);
    setShowAgeModal(false);
    track("age_confirm", storeCode);
    // 대기 중이던 아이템 장바구니에 추가
    if (pendingCartItem.current) {
      addItem(pendingCartItem.current);
      setToast("장바구니에 추가되었습니다");
      pendingCartItem.current = null;
    }
  };

  const handleAgeDecline = () => {
    setShowAgeModal(false);
    pendingCartItem.current = null;
  };

  // 매장이 없으면 에러
  if (!store) {
    return (
      <div className="min-h-dvh bg-[#FDFBF8] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-[#2A2A2A] text-lg font-semibold mb-2">매장을 찾을 수 없습니다</p>
          <p className="text-[#999] text-sm mb-6">QR 코드를 다시 스캔해주세요</p>
          <Link href="/order" className="text-[#1B4332] font-medium text-sm underline">
            매장 선택으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // QR 스캔 추적 (페이지 최초 진입)
  useEffect(() => {
    track("qr_scan", storeCode);
  }, [storeCode]);

  // ---- 주문 유형 선택 화면 (첫 화면) ----
  if (!orderType) {
    return (
      <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center justify-center px-6">
        <Image
          src="/images/logo_symbol.png"
          alt="SCOOPS GELATERIA"
          width={56}
          height={56}
          className="mb-4"
        />
        <p className="text-xs text-[#999] tracking-widest mb-1">SCOOPS GELATERIA</p>
        <p className="text-lg font-bold text-[#2A2A2A] mb-10">{store.name}</p>

        <div className="w-full max-w-[360px] space-y-4">
          <button
            onClick={() => { setOrderType("dine_in"); track("order_type", storeCode, { type: "dine_in" }); }}
            className="w-full py-6 bg-[#1B4332] text-white rounded-2xl text-center shadow-lg active:scale-[0.98] transition-transform"
          >
            <span className="text-xl font-bold block">매장식사</span>
            <span className="text-sm opacity-70 block mt-1">젤라또 · 소르베또 · 주류</span>
          </button>

          <button
            onClick={() => { setOrderType("takeaway"); track("order_type", storeCode, { type: "takeaway" }); }}
            className="w-full py-6 bg-white text-[#2A2A2A] rounded-2xl text-center border-2 border-[#1B4332] active:scale-[0.98] transition-transform"
          >
            <span className="text-xl font-bold block">포장</span>
            <span className="text-sm text-[#999] block mt-1">젤라또 · 소르베또</span>
          </button>
        </div>

        <div className="w-full max-w-[360px] mt-10 bg-[#F5F0EB] rounded-2xl px-5 py-4 text-center">
          <p className="text-[11px] text-[#BBB] mb-3">QR 모바일 주문</p>
          <div className="flex gap-3">
            <a
              href="https://scoopsgelato.kr"
              className="flex-1 h-9 flex items-center justify-center bg-white rounded-xl text-[13px] font-medium text-[#1B4332]"
            >
              공식홈페이지
            </a>
            <a
              href="https://www.instagram.com/_scoopsgelato_"
              className="flex-1 h-9 flex items-center justify-center bg-white rounded-xl text-[13px] font-medium text-[#1B4332]"
            >
              인스타그램
            </a>
          </div>
          <p className="text-[10px] text-[#BBB] mt-3">Tel. 1811-0259</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center">
      {/* ---- 상단 헤더 ---- */}
      <header className="w-full max-w-[480px] sticky top-0 z-40 bg-[#FDFBF8]/95 backdrop-blur-sm border-b border-[#EDE6DD]/50">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => setOrderType(null)}
            className="w-10 h-10 flex items-center justify-center -ml-2"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-[#2A2A2A]" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-[#999] tracking-widest">SCOOPS GELATERIA · {store.name}</p>
            <p className="text-sm font-bold text-[#1B4332]">
              {orderType === "dine_in" ? "매장식사" : "포장"}
            </p>
          </div>
          <div className="w-10" />
        </div>

      </header>

      {/* ---- 메인 콘텐츠 (한 페이지 스크롤) ---- */}
      <main className="w-full max-w-[480px] flex-1 px-4 pb-28">
        {/* ▸ 젤라또·소르베또 섹션 */}
        <div className="pt-6">
          <GelatoSection onAddToCart={handleAddToCart} orderType={orderType as "dine_in" | "takeaway"} />
        </div>

        {/* ▸ 주류 섹션 — 매장식사일 때만 표시 */}
        {orderType === "dine_in" && (
        <div ref={drinkSectionRef} className="pt-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-[#2A2A2A]">주류</h2>
            <span className="text-[10px] text-[#999]">만 19세 이상</span>
          </div>
          <p className="text-xs text-[#999] mb-4">위스키 · 와인 · 리큐르</p>

          {/* 주류 서브탭 */}
          <div className="flex gap-2 mb-5">
            {([
              { id: "cat3" as const, name: "위스키" },
              { id: "cat4" as const, name: "와인" },
              { id: "cat5" as const, name: "리큐르" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleDrinkTabClick(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  ageVerified && activeDrinkTab === tab.id
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "bg-white text-[#555] border border-[#EDE6DD]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 선택한 서브탭의 주류만 표시 (연령 확인은 장바구니 담기 시) */}
          {activeDrinkTab === "cat3" && (
            <DrinkSection
              categoryId="cat3"
              title="위스키"
              ageVerified={true}
              onAddToCart={handleAddToCart}
              onRequestAge={() => {}}
            />
          )}
          {activeDrinkTab === "cat4" && (
            <DrinkSection
              categoryId="cat4"
              title="와인"
              ageVerified={true}
              onAddToCart={handleAddToCart}
              onRequestAge={() => {}}
              showBottleNotice
            />
          )}
          {activeDrinkTab === "cat5" && (
            <DrinkSection
              categoryId="cat5"
              title="리큐르"
              ageVerified={true}
              onAddToCart={handleAddToCart}
              onRequestAge={() => {}}
            />
          )}
        </div>
        )}
      </main>

      {/* ---- 하단 장바구니 바 ---- */}
      <AnimatePresence>
        {totalCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <div className="w-full max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom,20px),20px)] bg-[#FDFBF8]">
              <Link
                href={`/order/${storeCode}/cart?type=${orderType}`}
                className="flex items-center justify-between w-full bg-[#1B4332] text-white rounded-2xl px-5 py-4 mb-2 shadow-lg active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={20} />
                  <span className="font-semibold">
                    장바구니 ({totalCount})
                  </span>
                </div>
                <span className="font-bold">{formatPrice(totalAmount)}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- 연령 확인 모달 ---- */}
      <AnimatePresence>
        {showAgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={handleAgeDecline}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl mx-6 p-8 max-w-[340px] w-full text-center shadow-xl"
            >
              <button
                onClick={handleAgeDecline}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#999]"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
              <Wine size={40} className="mx-auto text-[#1B4332] mb-4" />
              <p className="text-lg font-bold text-[#2A2A2A] mb-2">
                주류 주문 안내
              </p>
              <p className="text-sm text-[#555] mb-6 leading-relaxed">
                주류 주문은 만 19세 이상부터
                <br />
                가능합니다.
              </p>
              <p className="text-[15px] font-semibold text-[#2A2A2A] mb-5">
                만 19세 이상이신가요?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAgeDecline}
                  className="flex-1 py-3 rounded-xl border border-[#EDE6DD] text-[#555] font-medium text-sm"
                >
                  아니요
                </button>
                <button
                  onClick={handleAgeConfirm}
                  className="flex-1 py-3 rounded-xl bg-[#1B4332] text-white font-medium text-sm"
                >
                  예, 만 19세 이상입니다
                </button>
              </div>
              <p className="text-[11px] text-[#999] mt-4 leading-relaxed">
                주류 수령 시 매장 직원에게 신분증을 제시해주세요.
                <br />
                미성년자에게는 주류를 판매하지 않습니다.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- 토스트 ---- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 z-[70] flex justify-center pointer-events-none"
          >
            <div className="bg-[#2A2A2A] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              <Check size={16} className="inline mr-2 -mt-0.5" />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 젤라또·소르베또 섹션
// ============================================
function GelatoSection({
  onAddToCart,
  orderType,
}: {
  onAddToCart: (item: CartItem) => void;
  orderType: "dine_in" | "takeaway";
}) {
  const [selectedPrice, setSelectedPrice] = useState<GelatoPrice | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<MenuItem[]>([]);
  const isTakeaway = orderType === "takeaway";
  const TAKEAWAY_DISCOUNT = 1000;

  const allFlavors = getAllFlavors();
  const allPrices = [...gelatoPrices].sort((a, b) => a.flavorCount - b.flavorCount);

  const resetSelection = () => {
    setSelectedPrice(null);
    setSelectedFlavors([]);
  };

  const handlePriceSelect = (price: GelatoPrice) => {
    // 같은 걸 다시 누르면 접기 (토글)
    if (selectedPrice?.id === price.id) {
      setSelectedPrice(null);
      setSelectedFlavors([]);
      return;
    }
    setSelectedPrice(price);
    setSelectedFlavors([]);
  };

  const handleFlavorToggle = (flavor: MenuItem) => {
    if (!selectedPrice) return;

    setSelectedFlavors((prev) => {
      const exists = prev.find((f) => f.id === flavor.id);
      if (exists) return prev.filter((f) => f.id !== flavor.id);
      if (prev.length >= selectedPrice.flavorCount) return prev;
      return [...prev, flavor];
    });
  };

  const handleAddToCartClick = () => {
    if (!selectedPrice || selectedFlavors.length !== selectedPrice.flavorCount) return;

    const actualPrice = isTakeaway ? selectedPrice.price - TAKEAWAY_DISCOUNT : selectedPrice.price;
    const cartItem: CartItem = {
      cartId: `gelato_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "gelato",
      orderGroup: selectedPrice.optionGroup,
      flavorCount: selectedPrice.flavorCount,
      selectedFlavors: selectedFlavors.map((f) => ({ id: f.id, name: f.name })),
      quantity: 1,
      unitPrice: actualPrice,
      subtotal: actualPrice,
    };

    onAddToCart(cartItem);
    resetSelection();
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-[#2A2A2A] mb-1">젤라또 · 소르베또</h2>
      <p className="text-xs text-[#999] mb-5">젤라또 15종 + 소르베또 5종, 총 20가지 맛</p>

      {/* STEP 1: 맛 수 선택 (1~6가지 전부 표시) */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#2A2A2A] mb-3">몇 가지 맛을 고르실 건가요?</p>
        <div className="grid grid-cols-2 gap-2">
          {allPrices.map((p) => {
            const isCup = p.flavorCount <= 2;
            const displayPrice = isTakeaway ? p.price - TAKEAWAY_DISCOUNT : p.price;
            return (
              <button
                key={p.id}
                onClick={() => handlePriceSelect(p)}
                className={`py-3.5 px-4 rounded-2xl text-left transition-all ${
                  selectedPrice?.id === p.id
                    ? "bg-[#1B4332] text-white shadow-md"
                    : "bg-white text-[#2A2A2A] border border-[#EDE6DD] hover:border-[#1B4332]/30"
                }`}
              >
                <span className="text-sm font-bold">{p.flavorCount}가지 맛</span>
                <span
                  className={`block text-sm mt-0.5 ${
                    selectedPrice?.id === p.id ? "text-white/80" : "text-[#A68B5B]"
                  }`}
                >
                  {formatPrice(displayPrice)}
                  {isTakeaway && (
                    <span className={`ml-1 line-through text-xs ${
                      selectedPrice?.id === p.id ? "text-white/40" : "text-[#CCC]"
                    }`}>
                      {formatPrice(p.price)}
                    </span>
                  )}
                </span>
                <span
                  className={`block text-[10px] mt-1 ${
                    selectedPrice?.id === p.id ? "text-white/60" : "text-[#999]"
                  }`}
                >
                  {isCup ? "🍨 컵에 담아드려요" : "📦 테이크아웃 전용 박스"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#999] mt-3 leading-relaxed px-1">
          1~2가지 맛은 컵에 담아드리며, 3가지 맛부터는 테이크아웃 전용 박스에 담아드립니다.
          매장에서 드시는 경우에도 동일하게 제공됩니다.
        </p>
      </div>

      {/* STEP 2: 맛 선택 */}
      <AnimatePresence mode="wait">
        {selectedPrice && (() => {
          const isComplete = selectedFlavors.length === selectedPrice.flavorCount;
          return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* 선택 완료 → 압축 보기 */}
            {isComplete ? (
              <div
                className="bg-[#1B4332]/5 border border-[#1B4332]/20 rounded-2xl p-4 mb-4 cursor-pointer"
                onClick={() => setSelectedFlavors([])}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1B4332]">
                      {selectedPrice.flavorCount}가지 맛 · {formatPrice(isTakeaway ? selectedPrice.price - TAKEAWAY_DISCOUNT : selectedPrice.price)}
                    </p>
                    <p className="text-xs text-[#555] mt-1">
                      {selectedFlavors.map((f) => f.name).join(", ")}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#999]">변경</span>
                </div>
              </div>
            ) : (
              <>
                {/* 아직 선택 중 → 전체 그리드 */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#2A2A2A]">
                    맛을 골라주세요
                  </p>
                  <span className="text-sm text-[#1B4332] font-bold">
                    {selectedFlavors.length} / {selectedPrice.flavorCount}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {allFlavors.map((flavor) => {
                    const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                    const isFull =
                      selectedFlavors.length >= selectedPrice.flavorCount && !isSelected;
                    const isInactive = !flavor.isActive;

                    return (
                      <button
                        key={flavor.id}
                        onClick={() => !isFull && !isInactive && handleFlavorToggle(flavor)}
                        disabled={isFull || isInactive}
                        className={`relative rounded-2xl p-4 text-left transition-all ${
                          isSelected
                            ? "bg-[#1B4332] text-white shadow-md ring-2 ring-[#1B4332]"
                            : isFull || isInactive
                            ? "bg-[#F0EDEA] text-[#BBB] cursor-not-allowed"
                            : "bg-white text-[#2A2A2A] border border-[#EDE6DD] hover:border-[#1B4332]/30"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <Check size={12} className="text-[#1B4332]" />
                          </div>
                        )}
                        <p className="text-sm font-bold leading-tight">{flavor.name}</p>
                        {flavor.badge && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {flavor.badge.split(" ").map((b) => (
                              <span
                                key={b}
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  b === "NEW"
                                    ? isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-[#1B4332]/10 text-[#1B4332]"
                                    : isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-[#A68B5B]/10 text-[#A68B5B]"
                                }`}
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                        <p
                          className={`text-xs mt-1.5 line-clamp-1 ${
                            isSelected ? "text-white/70" : "text-[#999]"
                          }`}
                        >
                          {flavor.description}
                        </p>
                        <p className="text-[10px] mt-1 opacity-60">
                          {flavor.categoryId === "cat1" ? "젤라또" : "소르베또"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 장바구니 추가 버튼 — 하단 고정 */}
      {selectedPrice && selectedFlavors.length === selectedPrice.flavorCount && (
        <div className="fixed bottom-0 left-0 right-0 z-[55] flex justify-center pointer-events-none">
          <div className="w-full max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom,20px),20px)] pointer-events-auto">
            <button
              onClick={handleAddToCartClick}
              className="w-full py-4 rounded-2xl text-sm font-bold bg-[#1B4332] text-white shadow-lg active:scale-[0.98] transition-transform mb-2"
            >
              장바구니에 추가 · {formatPrice(isTakeaway ? selectedPrice.price - TAKEAWAY_DISCOUNT : selectedPrice.price)}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

// ============================================
// 주류 섹션 (위스키/와인/리큐르)
// ============================================
function DrinkSection({
  categoryId,
  title,
  ageVerified,
  onAddToCart,
  onRequestAge,
  showBottleNotice,
}: {
  categoryId: string;
  title: string;
  ageVerified: boolean;
  onAddToCart: (item: CartItem) => void;
  onRequestAge: () => void;
  showBottleNotice?: boolean;
}) {
  const items = getItemsByCategory(categoryId);

  if (!ageVerified) {
    return (
      <section>
        <h2 className="text-lg font-bold text-[#2A2A2A] mb-1">{title}</h2>
        <p className="text-xs text-[#999] mb-4">주류 판매는 만 19세 이상 가능합니다</p>
        <button
          onClick={onRequestAge}
          className="w-full py-4 rounded-2xl bg-white border border-[#EDE6DD] text-[#555] text-sm font-medium"
        >
          연령 확인 후 메뉴 보기
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="space-y-3">
        {items.map((item) => (
          <DrinkItemCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {showBottleNotice && (
        <div className="mt-4 p-4 bg-[#EDE6DD]/40 rounded-2xl">
          <p className="text-xs text-[#555]">
            🍷 보틀와인은 직원에게 문의해주세요
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================
// 주류 아이템 카드 (아코디언 — 클릭해야 옵션/수량 펼침)
// ============================================
function DrinkItemCard({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart: (item: CartItem) => void;
}) {
  const prices = getPricesForItem(item.id);
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedOption, setSelectedOption] = useState<typeof prices[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const drinkInfo = getDrinkDescription(item.id);
  const [pairingMode, setPairingMode] = useState(false);
  const [pairingGelatoCount, setPairingGelatoCount] = useState<1 | 2 | null>(null);
  const [pairingDrinkOption, setPairingDrinkOption] = useState<typeof prices[0] | null>(null);
  const [pairingExtraFlavor, setPairingExtraFlavor] = useState<{ id: string; name: string } | null>(null); // 2가지맛 시 추가 맛

  const handleToggle = () => {
    if (isOpen) {
      // 접기 → 초기화
      setIsOpen(false);
      setSelectedOption(null);
      setQuantity(1);
    } else {
      setIsOpen(true);
    }
  };

  const handleAdd = () => {
    if (!selectedOption) return;

    const cartItem: CartItem = {
      cartId: `drink_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "drink",
      menuItem: { id: item.id, name: item.name, nameEn: item.nameEn },
      optionName: selectedOption.optionName,
      quantity,
      unitPrice: selectedOption.price,
      subtotal: selectedOption.price * quantity,
    };

    onAddToCart(cartItem);
    // 추가 후 접기
    setIsOpen(false);
    setSelectedOption(null);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next < 1) return;
    if (next > 10) {
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 2000);
      return;
    }
    setQuantity(next);
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all ${isOpen ? "border-[#1B4332]/30 shadow-sm" : "border-[#EDE6DD]/60"}`}>
      {/* 아이템 헤더 — 클릭하면 펼침/접힘 */}
      <div className="flex items-center p-4">
        <button
          onClick={handleToggle}
          className="flex-1 flex items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-bold text-[#2A2A2A]">{item.name}</p>
            {item.nameEn && (
              <p className="text-xs text-[#999]">{item.nameEn}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A68B5B]/10 text-[#A68B5B]">
                {item.badge}
              </span>
          )}
          <span className={`text-[#999] transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
          </div>
        </button>
        {/* 주류 설명 버튼 */}
        {drinkInfo && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
            className="ml-2 px-2.5 py-1 rounded-lg bg-[#F5F0EB] text-[#A68B5B] text-[11px] font-medium hover:bg-[#EDE6DD] transition-colors flex-shrink-0"
          >
            설명
          </button>
        )}
      </div>

      {/* 위스키 설명 팝업 */}
      <AnimatePresence>
        {showInfo && drinkInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl mx-4 p-6 max-w-[360px] w-full shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#999]"
              >
                <X size={20} />
              </button>

              <p className="text-lg font-bold text-[#2A2A2A] mb-0.5">{item.name}</p>
              {item.nameEn && <p className="text-xs text-[#999] mb-4">{item.nameEn}</p>}

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-[#999] w-12 flex-shrink-0">산지</span>
                  <span className="text-[#2A2A2A]">{drinkInfo.origin}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#999] w-12 flex-shrink-0">종류</span>
                  <span className="text-[#2A2A2A]">{drinkInfo.type} · {drinkInfo.abv}</span>
                </div>
                <hr className="border-[#EDE6DD]" />
                <div>
                  <p className="text-xs text-[#A68B5B] font-bold mb-1">향 (Nose)</p>
                  <p className="text-[#555] text-[13px] leading-relaxed">{drinkInfo.nose}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A68B5B] font-bold mb-1">맛 (Palate)</p>
                  <p className="text-[#555] text-[13px] leading-relaxed">{drinkInfo.palate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A68B5B] font-bold mb-1">여운 (Finish)</p>
                  <p className="text-[#555] text-[13px] leading-relaxed">{drinkInfo.finish}</p>
                </div>
                <hr className="border-[#EDE6DD]" />
                <div className="bg-[#1B4332]/5 rounded-xl p-3">
                  <p className="text-xs text-[#1B4332] font-bold mb-1">추천</p>
                  <p className="text-[#555] text-[13px] leading-relaxed">{drinkInfo.recommend}</p>
                </div>
                {drinkInfo.gelatoPairing && drinkInfo.gelatoPairingId && (() => {
                  const pairingFlavor = menuItems.find((m) => m.id === drinkInfo.gelatoPairingId);
                  const pairingName = pairingFlavor?.name || drinkInfo.gelatoPairing.split(" — ")[0];
                  const pairingDesc = drinkInfo.gelatoPairing.split(" — ")[1] || "";
                  return (
                    <div className="bg-[#A68B5B]/5 rounded-xl p-3">
                      <p className="text-xs text-[#A68B5B] font-bold mb-2">🍨 함께 먹으면 좋은 젤라또</p>
                      {!pairingMode ? (
                        <button
                          onClick={() => setPairingMode(true)}
                          className="w-full text-left"
                        >
                          <p className="text-[#2A2A2A] text-[13px] font-semibold">{pairingName}</p>
                          <p className="text-[#999] text-[11px] mt-0.5">{pairingDesc}</p>
                          <p className="text-[#1B4332] text-[11px] font-medium mt-1.5">이 조합으로 주문하기 →</p>
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 mt-2"
                        >
                          {/* 젤라또 맛 수 선택 */}
                          <div>
                            <p className="text-[11px] text-[#555] mb-1.5">🍨 {pairingName} 몇 가지 맛?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setPairingGelatoCount(1); setPairingExtraFlavor(null); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                                  pairingGelatoCount === 1
                                    ? "bg-[#1B4332] text-white"
                                    : "bg-white text-[#555] border border-[#EDE6DD]"
                                }`}
                              >
                                1가지 맛<br /><span className="font-bold">5,000원</span>
                              </button>
                              <button
                                onClick={() => { setPairingGelatoCount(2); setPairingExtraFlavor(null); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                                  pairingGelatoCount === 2
                                    ? "bg-[#1B4332] text-white"
                                    : "bg-white text-[#555] border border-[#EDE6DD]"
                                }`}
                              >
                                2가지 맛<br /><span className="font-bold">6,000원</span>
                              </button>
                            </div>
                          </div>

                          {/* 2가지맛 선택 시 — 추가 맛 선택 */}
                          {pairingGelatoCount === 2 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                              <p className="text-[11px] text-[#555] mb-1.5">
                                🍨 두 번째 맛을 골라주세요 <span className="text-[#999]">(1번째: {pairingName})</span>
                              </p>
                              <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto">
                                {getAllFlavors()
                                  .filter(f => f.id !== drinkInfo.gelatoPairingId)
                                  .map(f => (
                                    <button
                                      key={f.id}
                                      onClick={() => setPairingExtraFlavor(pairingExtraFlavor?.id === f.id ? null : { id: f.id, name: f.name })}
                                      className={`py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                                        pairingExtraFlavor?.id === f.id
                                          ? "bg-[#1B4332] text-white"
                                          : "bg-white text-[#555] border border-[#EDE6DD]"
                                      }`}
                                    >
                                      {f.name}
                                    </button>
                                  ))}
                              </div>
                            </motion.div>
                          )}

                          {/* 주류 옵션 선택 */}
                          <div>
                            <p className="text-[11px] text-[#555] mb-1.5">🥃 {item.name} 옵션</p>
                            <div className="flex gap-2">
                              {prices.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setPairingDrinkOption(p)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                                    pairingDrinkOption?.id === p.id
                                      ? "bg-[#1B4332] text-white"
                                      : "bg-white text-[#555] border border-[#EDE6DD]"
                                  }`}
                                >
                                  {p.optionName}<br /><span className="font-bold">{formatPrice(p.price)}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 합계 + 장바구니 담기 */}
                          {pairingGelatoCount && pairingDrinkOption && (pairingGelatoCount === 1 || pairingExtraFlavor) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <div className="flex justify-between text-xs text-[#555] mb-2">
                                <span>합계</span>
                                <span className="font-bold text-[#2A2A2A]">
                                  {formatPrice(
                                    (pairingGelatoCount === 1 ? 5000 : 6000) + pairingDrinkOption.price
                                  )}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  // 젤라또 장바구니 추가
                                  const flavors = [{ id: drinkInfo.gelatoPairingId!, name: pairingName }];
                                  if (pairingGelatoCount === 2 && pairingExtraFlavor) {
                                    flavors.push(pairingExtraFlavor);
                                  }
                                  onAddToCart({
                                    cartId: `gelato_pair_${Date.now()}`,
                                    type: "gelato",
                                    orderGroup: "EAT NOW",
                                    flavorCount: pairingGelatoCount,
                                    selectedFlavors: flavors,
                                    quantity: 1,
                                    unitPrice: pairingGelatoCount === 1 ? 5000 : 6000,
                                    subtotal: pairingGelatoCount === 1 ? 5000 : 6000,
                                  });
                                  // 주류 장바구니 추가
                                  onAddToCart({
                                    cartId: `drink_pair_${Date.now()}`,
                                    type: "drink",
                                    menuItem: { id: item.id, name: item.name, nameEn: item.nameEn },
                                    optionName: pairingDrinkOption.optionName,
                                    quantity: 1,
                                    unitPrice: pairingDrinkOption.price,
                                    subtotal: pairingDrinkOption.price,
                                  });
                                  // 초기화 + 팝업 닫기
                                  setPairingMode(false);
                                  setPairingGelatoCount(null);
                                  setPairingExtraFlavor(null);
                                  setPairingDrinkOption(null);
                                  setShowInfo(false);
                                }}
                                className="w-full py-3 bg-[#1B4332] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
                              >
                                함께 장바구니에 담기
                              </button>
                            </motion.div>
                          )}

                          <button
                            onClick={() => { setPairingMode(false); setPairingGelatoCount(null); setPairingDrinkOption(null); setPairingExtraFlavor(null); }}
                            className="w-full text-center text-[11px] text-[#999] py-1"
                          >
                            취소
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 펼쳐진 상태: 옵션 선택 → 수량 → 담기 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* 옵션 선택 */}
              <p className="text-xs text-[#555] mb-2">옵션을 선택해주세요</p>
              <div className="flex gap-2 mb-3">
                {prices.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      // 토글: 같은 옵션 다시 누르면 해제
                      if (selectedOption?.id === p.id) {
                        setSelectedOption(null);
                        setQuantity(1);
                      } else {
                        setSelectedOption(p);
                        setQuantity(1);
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      selectedOption?.id === p.id
                        ? "bg-[#1B4332] text-white"
                        : "bg-[#F5F0EB] text-[#555]"
                    }`}
                  >
                    {p.optionName}
                    <span className="block font-bold mt-0.5">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>

              {/* 옵션 선택 후에만 수량 + 담기 표시 */}
              {selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        quantity <= 1 ? "bg-[#F0EDEA] text-[#BBB]" : "bg-[#F5F0EB] text-[#2A2A2A]"
                      }`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold text-[#2A2A2A] w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-9 h-9 rounded-full bg-[#F5F0EB] text-[#2A2A2A] flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
                  >
                    {formatPrice(selectedOption.price * quantity)} 담기
                  </button>
                </motion.div>
              )}

              {/* 수량 초과 경고 */}
              <AnimatePresence>
                {showMaxWarning && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-2"
                  >
                    10잔 이상은 매장 직원에게 문의해주세요
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
