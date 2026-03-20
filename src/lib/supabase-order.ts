import type {
  Store,
  MenuCategory,
  MenuItem,
  MenuPrice,
  GelatoPrice,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderDataSource,
} from "./order-types";
import {
  stores,
  menuCategories,
  menuItems,
  menuPrices,
  gelatoPrices,
} from "./order-data";
import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
  supabaseRpc,
} from "./supabase-client";

// ============================================
// Supabase 사용 가능 여부 체크
// ============================================
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
  );
}

// ============================================
// DB 행 → Order 타입 변환
// ============================================
interface OrderRow {
  id: string;
  store_id: string;
  order_number: string;
  order_type: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total_amount: number;
  memo: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  item_name: string;
  option_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_flavors: string[] | null;
}

function rowToOrder(row: OrderRow, itemRows: OrderItemRow[]): Order {
  return {
    id: row.id,
    storeId: row.store_id,
    orderNumber: row.order_number,
    orderType: row.order_type as Order["orderType"],
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: (row.payment_method || null) as PaymentMethod,
    totalAmount: row.total_amount,
    memo: row.memo || undefined,
    customerPhone: row.customer_phone || undefined,
    items: itemRows.map((ir) => ({
      id: ir.id,
      orderId: ir.order_id,
      itemName: ir.item_name,
      optionName: ir.option_name,
      quantity: ir.quantity,
      unitPrice: ir.unit_price,
      subtotal: ir.subtotal,
      selectedFlavors: ir.selected_flavors || undefined,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// Supabase 데이터 소스
// ============================================
const supabaseDataSource: OrderDataSource = {
  // 메뉴 데이터는 여전히 로컬 (변경 빈도 낮음)
  async getStores() {
    return stores;
  },
  async getStoreByCode(code: string) {
    return stores.find((s) => s.code === code) || null;
  },
  async getMenuCategories() {
    return menuCategories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getMenuItems(categoryId?: string) {
    let items = menuItems.filter((m) => m.isActive);
    if (categoryId) items = items.filter((m) => m.categoryId === categoryId);
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getMenuPrices(itemId?: string) {
    let prices = menuPrices.filter((p) => p.isActive);
    if (itemId) prices = prices.filter((p) => p.itemId === itemId);
    return prices.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getGelatoPrices() {
    return gelatoPrices.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // ---- 주문 CRUD → Supabase DB (RPC로 1회 호출) ----
  async createOrder(orderData) {
    // RPC 1회 호출로 주문번호 생성 + orders INSERT + order_items INSERT 수행
    const rpcResult = await supabaseRpc<{ id: string; order_number: string; status: string }>(
      "create_order_with_items",
      {
        p_store_id: orderData.storeId,
        p_order_type: orderData.orderType,
        p_total_amount: orderData.totalAmount,
        p_memo: orderData.memo || null,
        p_customer_phone: orderData.customerPhone || null,
        p_items: orderData.items.map((item) => ({
          item_name: item.itemName,
          option_name: item.optionName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
          selected_flavors: item.selectedFlavors || null,
        })),
      }
    );

    return {
      id: rpcResult.id,
      storeId: orderData.storeId,
      orderNumber: rpcResult.order_number,
      orderType: orderData.orderType,
      status: rpcResult.status as OrderStatus,
      paymentStatus: "unpaid" as PaymentStatus,
      paymentMethod: null as PaymentMethod,
      totalAmount: orderData.totalAmount,
      memo: orderData.memo,
      customerPhone: orderData.customerPhone,
      items: orderData.items.map((item, idx) => ({
        id: `oi_${idx}`,
        orderId: rpcResult.id,
        itemName: item.itemName,
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        selectedFlavors: item.selectedFlavors,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Order;
  },

  async getOrder(orderId: string) {
    const rows = await supabaseSelect<OrderRow[]>(
      "orders",
      `id=eq.${orderId}`
    );
    if (rows.length === 0) return null;

    const itemRows = await supabaseSelect<OrderItemRow[]>(
      "order_items",
      `order_id=eq.${orderId}&order=id.asc`
    );

    return rowToOrder(rows[0], itemRows);
  },

  async getOrders(storeId: string, status?: OrderStatus) {
    // RPC 1회 호출로 orders + items 모두 가져옴
    const result = await supabaseRpc<Order[] | null>(
      "get_orders_with_items",
      {
        p_store_id: storeId,
        p_status: status || null,
      }
    );
    return result || [];
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    await supabaseUpdate("orders", `id=eq.${orderId}`, {
      status,
      updated_at: new Date().toISOString(),
    });
  },

  async updatePaymentStatus(orderId: string, status: PaymentStatus, method?: PaymentMethod) {
    const data: Record<string, unknown> = {
      payment_status: status,
      updated_at: new Date().toISOString(),
    };
    if (method) data.payment_method = method;
    await supabaseUpdate("orders", `id=eq.${orderId}`, data);
  },

  async getNextOrderNumber(storeId: string) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // "2026-03-21"

    // 오늘 이 매장의 마지막 주문번호 조회
    const rows = await supabaseSelect<OrderRow[]>(
      "orders",
      `store_id=eq.${storeId}&created_at=gte.${today}T00:00:00Z&created_at=lt.${today}T23:59:59Z&order=order_number.desc&limit=1`
    );

    let nextNum = 1;
    if (rows.length > 0) {
      const match = rows[0].order_number.match(/^A(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    } else {
      // 오늘 첫 주문이면 시간 기반으로 높은 번호 시작 (역행 방지)
      const h = now.getHours();
      const m = now.getMinutes();
      nextNum = Math.max(h * 100 + m + 1, 101);
    }

    return `A${String(nextNum).padStart(3, "0")}`;
  },
};

// ============================================
// 인메모리 폴백 (Supabase 설정 안 됐을 때)
// ============================================
const orderStore: Order[] =
  ((globalThis as Record<string, unknown>).__orderStore as Order[]) || [];
if (!(globalThis as Record<string, unknown>).__orderStore) {
  (globalThis as Record<string, unknown>).__orderStore = orderStore;
}

const orderCounters: Record<string, number> =
  ((globalThis as Record<string, unknown>).__orderCounters as Record<string, number>) || {};
if (!(globalThis as Record<string, unknown>).__orderCounters) {
  (globalThis as Record<string, unknown>).__orderCounters = orderCounters;
}

const localDataSource: OrderDataSource = {
  async getStores() { return stores; },
  async getStoreByCode(code: string) { return stores.find((s) => s.code === code) || null; },
  async getMenuCategories() {
    return menuCategories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getMenuItems(categoryId?: string) {
    let items = menuItems.filter((m) => m.isActive);
    if (categoryId) items = items.filter((m) => m.categoryId === categoryId);
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getMenuPrices(itemId?: string) {
    let prices = menuPrices.filter((p) => p.isActive);
    if (itemId) prices = prices.filter((p) => p.itemId === itemId);
    return prices.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getGelatoPrices() { return gelatoPrices.sort((a, b) => a.sortOrder - b.sortOrder); },
  async createOrder(orderData) {
    const now = new Date().toISOString();
    // orderNumber가 비어있으면 자체 생성
    let orderNumber = orderData.orderNumber;
    if (!orderNumber) {
      orderNumber = await localDataSource.getNextOrderNumber(orderData.storeId);
    }
    const order: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };
    orderStore.push(order);
    return order;
  },
  async getOrder(orderId: string) { return orderStore.find((o) => o.id === orderId) || null; },
  async getOrders(storeId: string, status?: OrderStatus) {
    let orders = orderStore.filter((o) => o.storeId === storeId);
    if (status) orders = orders.filter((o) => o.status === status);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = orderStore.find((o) => o.id === orderId);
    if (order) { order.status = status; order.updatedAt = new Date().toISOString(); }
  },
  async updatePaymentStatus(orderId: string, status: PaymentStatus, method?: PaymentMethod) {
    const order = orderStore.find((o) => o.id === orderId);
    if (order) {
      order.paymentStatus = status;
      if (method) order.paymentMethod = method;
      order.updatedAt = new Date().toISOString();
    }
  },
  async getNextOrderNumber(storeId: string) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const key = `${storeId}_${today}`;
    if (!orderCounters[key]) {
      let maxNum = 0;
      for (const order of orderStore) {
        if (order.storeId === storeId && order.createdAt.startsWith(today)) {
          const match = order.orderNumber.match(/^A(\d+)$/);
          if (match) { const n = parseInt(match[1], 10); if (n > maxNum) maxNum = n; }
        }
      }
      if (maxNum === 0) {
        const h = now.getHours();
        const m = now.getMinutes();
        maxNum = Math.max(h * 100 + m, 100);
      }
      orderCounters[key] = maxNum;
    }
    orderCounters[key]++;
    return `A${String(orderCounters[key]).padStart(3, "0")}`;
  },
};

// ============================================
// 데이터 소스 팩토리
// ============================================
export function getOrderDataSource(): OrderDataSource {
  if (isSupabaseConfigured()) {
    console.log("[Order] Using Supabase DB");
    return supabaseDataSource;
  }
  console.log("[Order] Using in-memory (no Supabase configured)");
  return localDataSource;
}

export default getOrderDataSource;
