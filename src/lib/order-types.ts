// ============================================
// QR 주문 시스템 — TypeScript 타입 정의
// ============================================

// ---------- 매장 ----------
export interface Store {
  id: string;
  name: string;
  code: string; // URL/QR용 (예: "cheongju")
  address?: string;
  phone?: string;
  isActive: boolean;
  businessHours?: string;
}

// ---------- 메뉴 카테고리 ----------
export interface MenuCategory {
  id: string;
  name: string; // "젤라또", "소르베또", "위스키", "와인", "리큐르"
  sortOrder: number;
  isActive: boolean;
}

// ---------- 메뉴 아이템 ----------
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameEn?: string;
  description?: string;
  badge?: string | null; // "SIGNATURE", "BEST", "NEW", "추천" 등, 복수 가능 (공백 구분)
  isActive: boolean;
  sortOrder: number;
}

// ---------- 메뉴 가격 옵션 ----------
export interface MenuPrice {
  id: string;
  itemId: string; // 젤라또/소르베또는 카테고리 공유 가격이므로 특수 처리
  optionName: string; // "1가지맛", "30ml", "50ml", "bottle"
  optionGroup?: "EAT NOW" | "TAKE AWAY" | null;
  price: number; // 원 단위
  sortOrder: number;
  isActive: boolean;
}

// ---------- 젤라또/소르베또 전용: 맛 가지 수 기반 가격 ----------
export interface GelatoPrice {
  id: string;
  optionGroup: "EAT NOW" | "TAKE AWAY";
  flavorCount: number; // 1, 2, 3, 4, 5, 6
  price: number;
  sortOrder: number;
}

// ---------- 주문 ----------
export type OrderType = "dine_in" | "takeaway";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod =
  | "card_online"
  | "card_offline"
  | "cash"
  | "kakao"
  | "naver"
  | "toss"
  | null;

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string; // "A001"
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  pgTransactionId?: string;
  customerPhone?: string;
  memo?: string;
  items: OrderItem[];
  createdAt: string; // ISO
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId?: string;
  priceId?: string;
  itemName: string; // 스냅샷
  optionName: string; // 스냅샷
  quantity: number;
  unitPrice: number;
  subtotal: number;
  // 젤라또/소르베또 전용
  selectedFlavors?: string[];
}

// ---------- 장바구니 (클라이언트 상태) ----------
export interface CartItem {
  cartId: string; // 클라이언트 고유 ID
  type: "gelato" | "drink";
  // 젤라또/소르베또
  orderGroup?: "EAT NOW" | "TAKE AWAY";
  flavorCount?: number;
  selectedFlavors?: { id: string; name: string }[];
  // 주류
  menuItem?: { id: string; name: string; nameEn?: string };
  optionName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ---------- Supabase 스위칭 인터페이스 ----------
export interface OrderDataSource {
  getStores(): Promise<Store[]>;
  getStoreByCode(code: string): Promise<Store | null>;
  getMenuCategories(): Promise<MenuCategory[]>;
  getMenuItems(categoryId?: string): Promise<MenuItem[]>;
  getMenuPrices(itemId?: string): Promise<MenuPrice[]>;
  getGelatoPrices(): Promise<GelatoPrice[]>;
  createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  getOrders(storeId: string, status?: OrderStatus): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(orderId: string, status: PaymentStatus, method?: PaymentMethod): Promise<void>;
  getNextOrderNumber(storeId: string): Promise<string>;
}
