"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem } from "./order-types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  setStoreCode: (code: string) => void;
  totalCount: number;
  totalAmount: number;
  memo: string;
  setMemo: (memo: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "scoops_cart";
const MEMO_STORAGE_KEY = "scoops_memo";
const STORE_KEY = "scoops_store";

// sessionStorage 안전 접근 (SSR 대비)
function safeGetSession(key: string): string | null {
  try {
    if (typeof window !== "undefined") return sessionStorage.getItem(key);
  } catch {}
  return null;
}

function safeSetSession(key: string, value: string) {
  try {
    if (typeof window !== "undefined") sessionStorage.setItem(key, value);
  } catch {}
}

function safeRemoveSession(key: string) {
  try {
    if (typeof window !== "undefined") sessionStorage.removeItem(key);
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [memo, setMemo] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // 마운트 시 sessionStorage에서 복원
  useEffect(() => {
    try {
      const savedCart = safeGetSession(CART_STORAGE_KEY);
      const savedMemo = safeGetSession(MEMO_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
      if (savedMemo) setMemo(savedMemo);
    } catch {}
    setHydrated(true);
  }, []);

  // items 변경 시 sessionStorage에 저장 (직렬화 안전 처리)
  useEffect(() => {
    if (!hydrated) return;
    if (items.length > 0) {
      // menuItem에서 직렬화 가능한 필드만 추출 (함수/참조 제거)
      const safeItems = items.map(({ menuItem, ...rest }) => ({
        ...rest,
        menuItem: menuItem ? { id: menuItem.id, name: menuItem.name, nameEn: menuItem.nameEn } : undefined,
      }));
      safeSetSession(CART_STORAGE_KEY, JSON.stringify(safeItems));
    } else {
      safeRemoveSession(CART_STORAGE_KEY);
    }
  }, [items, hydrated]);

  // memo 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (!hydrated) return;
    if (memo) {
      safeSetSession(MEMO_STORAGE_KEY, memo);
    } else {
      safeRemoveSession(MEMO_STORAGE_KEY);
    }
  }, [memo, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // 주류: 같은 메뉴 + 같은 옵션이면 수량 합산
      if (item.type === "drink" && item.menuItem) {
        const existing = prev.find(
          (p) =>
            p.type === "drink" &&
            p.menuItem?.id === item.menuItem?.id &&
            p.optionName === item.optionName
        );
        if (existing) {
          return prev.map((p) =>
            p.cartId === existing.cartId
              ? {
                  ...p,
                  quantity: p.quantity + item.quantity,
                  subtotal: (p.quantity + item.quantity) * p.unitPrice,
                }
              : p
          );
        }
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setMemo("");
    safeRemoveSession(CART_STORAGE_KEY);
    safeRemoveSession(MEMO_STORAGE_KEY);
  }, []);

  // 매장 전환 시 장바구니 초기화 (청주본점에서 담고 여의도점 이동 방지)
  const setStoreCode = useCallback((code: string) => {
    const prev = safeGetSession(STORE_KEY);
    if (prev && prev !== code) {
      // 다른 매장으로 이동 → 장바구니 비우기
      setItems([]);
      setMemo("");
      safeRemoveSession(CART_STORAGE_KEY);
      safeRemoveSession(MEMO_STORAGE_KEY);
    }
    safeSetSession(STORE_KEY, code);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, setStoreCode, totalCount, totalAmount, memo, setMemo }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
