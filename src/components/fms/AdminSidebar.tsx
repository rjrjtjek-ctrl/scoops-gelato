"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, ShoppingCart, UtensilsCrossed,
  Package, Megaphone, BookOpen, BarChart3, Users, ClipboardList,
  ListTodo, X, Eye, MessageSquare, QrCode, Headphones
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean; // Phase별 활성화 여부
}

interface AdminSidebarProps {
  role: "hq_admin" | "franchisee" | "employee";
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ role, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const hqMenus: MenuItem[] = [
    { label: "대시보드", href: "/admin/hq", icon: <LayoutDashboard size={18} />, active: true },
    { label: "매장관리", href: "/admin/hq/stores", icon: <Store size={18} />, active: true },
    { label: "발주관리", href: "/admin/hq/orders", icon: <ShoppingCart size={18} />, active: true },
    { label: "메뉴관리", href: "/admin/hq/menu", icon: <UtensilsCrossed size={18} />, active: true },
    { label: "제품카탈로그", href: "/admin/hq/catalog", icon: <Package size={18} />, active: true },
    { label: "공지사항", href: "/admin/hq/notices", icon: <Megaphone size={18} />, active: true },
    { label: "지식베이스", href: "/admin/hq/knowledge", icon: <BookOpen size={18} />, active: true },
    { label: "분석", href: "/admin/hq/analytics", icon: <BarChart3 size={18} />, active: true },
    // ── 기존 관리자 기능 ──
    { label: "QR 주문관리", href: "/admin/orders", icon: <QrCode size={18} />, active: true },
    { label: "주문내역", href: "/admin/orders/history", icon: <ClipboardList size={18} />, active: true },
    { label: "주문분석", href: "/admin/orders/analytics", icon: <BarChart3 size={18} />, active: true },
    { label: "가맹문의", href: "/admin/inquiries", icon: <MessageSquare size={18} />, active: true },
    { label: "방문자통계", href: "/admin/analytics", icon: <Eye size={18} />, active: true },
    { label: "고객의소리", href: "/admin/customer", icon: <Headphones size={18} />, active: true },
    { label: "QR코드관리", href: "/admin/qr", icon: <QrCode size={18} />, active: true },
  ];

  const storeMenus: MenuItem[] = [
    { label: "대시보드", href: "/admin/store", icon: <LayoutDashboard size={18} />, active: true },
    { label: "직원관리", href: "/admin/store/employees", icon: <Users size={18} />, active: true },
    { label: "메뉴관리", href: "/admin/store/menu", icon: <UtensilsCrossed size={18} />, active: true },
    { label: "판매현황", href: "/admin/store/sales", icon: <BarChart3 size={18} />, active: true },
    { label: "발주내역", href: "/admin/store/orders", icon: <ShoppingCart size={18} />, active: true },
    { label: "할일관리", href: "/admin/store/tasks", icon: <ListTodo size={18} />, active: true },
    { label: "공지사항", href: "/admin/store/notices", icon: <Megaphone size={18} />, active: true },
  ];

  const menus = role === "hq_admin" ? hqMenus : storeMenus;

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1a1a1a" }}
      >
        {/* 로고 */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
          <span className="text-white font-bold text-sm tracking-wide">SCOOPS GELATO</span>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="mt-4 px-3 space-y-1">
          {menus.map((item) => {
            const isCurrent = pathname === item.href;
            if (!item.active) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 cursor-not-allowed"
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                  <span className="ml-auto text-[10px] text-gray-700 bg-gray-800 px-1.5 py-0.5 rounded">준비중</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isCurrent
                    ? "text-[#D4A574] bg-white/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
