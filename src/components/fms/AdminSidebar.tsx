"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, ShoppingCart, UtensilsCrossed,
  Package, Megaphone, BookOpen, BarChart3, Users, ClipboardList,
  ListTodo, X, Eye, MessageSquare, QrCode, Headphones,
  ChevronDown, ChevronRight, DollarSign
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  defaultOpen?: boolean;
}

interface AdminSidebarProps {
  role: "hq_admin" | "franchisee" | "employee";
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ role, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const hqSections: MenuSection[] = [
    {
      title: "본사 관리",
      icon: <LayoutDashboard size={16} />,
      defaultOpen: true,
      items: [
        { label: "대시보드", href: "/admin/hq", icon: <LayoutDashboard size={16} /> },
        { label: "매장관리", href: "/admin/hq/stores", icon: <Store size={16} /> },
        { label: "공지사항", href: "/admin/hq/announcements", icon: <Megaphone size={16} /> },
        { label: "분석", href: "/admin/hq/analytics", icon: <BarChart3 size={16} /> },
      ],
    },
    {
      title: "상품 · 발주",
      icon: <ShoppingCart size={16} />,
      items: [
        { label: "정산관리", href: "/admin/hq/settlement", icon: <DollarSign size={16} /> },
        { label: "발주관리", href: "/admin/hq/orders", icon: <ShoppingCart size={16} /> },
        { label: "본사제품관리", href: "/admin/hq/products", icon: <Package size={16} /> },
        { label: "메뉴관리", href: "/admin/hq/menu", icon: <UtensilsCrossed size={16} /> },
        { label: "제품카탈로그", href: "/admin/hq/catalog", icon: <Package size={16} /> },
      ],
    },
    {
      title: "AI · 지식",
      icon: <BookOpen size={16} />,
      items: [
        { label: "지식베이스", href: "/admin/hq/knowledge", icon: <BookOpen size={16} /> },
        { label: "작업분석", href: "/admin/hq/work-analysis", icon: <BarChart3 size={16} /> },
      ],
    },
    {
      title: "점주 기능 (열람)",
      icon: <Store size={16} />,
      items: [
        { label: "할일관리", href: "/admin/store/tasks", icon: <ListTodo size={16} /> },
        { label: "작업기록", href: "/admin/store/tasks/logs", icon: <ClipboardList size={16} /> },
        { label: "직원관리", href: "/admin/store/employees", icon: <Users size={16} /> },
        { label: "매장메뉴ON/OFF", href: "/admin/store/menu", icon: <UtensilsCrossed size={16} /> },
        { label: "매장판매현황", href: "/admin/store/sales", icon: <BarChart3 size={16} /> },
        { label: "매장발주내역", href: "/admin/store/orders", icon: <ShoppingCart size={16} /> },
        { label: "매장공지", href: "/admin/store/announcements", icon: <Megaphone size={16} /> },
      ],
    },
    {
      title: "직원 화면 (열람)",
      icon: <Users size={16} />,
      items: [
        { label: "직원 홈", href: "/admin/staff", icon: <LayoutDashboard size={16} /> },
        { label: "직원 할일", href: "/admin/staff/tasks", icon: <ListTodo size={16} /> },
        { label: "직원 공지", href: "/admin/staff/announcements", icon: <Megaphone size={16} /> },
        { label: "직원 메뉴ON/OFF", href: "/admin/staff/menu", icon: <UtensilsCrossed size={16} /> },
        { label: "직원 발주내역", href: "/admin/staff/orders", icon: <ShoppingCart size={16} /> },
      ],
    },
    {
      title: "운영 도구",
      icon: <QrCode size={16} />,
      defaultOpen: true,
      items: [
        { label: "QR 주문관리", href: "/admin/orders", icon: <QrCode size={16} /> },
        { label: "주문내역", href: "/admin/orders/history", icon: <ClipboardList size={16} /> },
        { label: "주문분석", href: "/admin/orders/analytics", icon: <BarChart3 size={16} /> },
        { label: "가맹문의", href: "/admin/inquiries", icon: <MessageSquare size={16} /> },
        { label: "방문자통계", href: "/admin/analytics", icon: <Eye size={16} /> },
        { label: "고객의소리", href: "/admin/customer", icon: <Headphones size={16} /> },
        { label: "QR코드관리", href: "/admin/qr", icon: <QrCode size={16} /> },
      ],
    },
  ];

  const storeSections: MenuSection[] = [
    {
      title: "매장 관리",
      icon: <Store size={16} />,
      defaultOpen: true,
      items: [
        { label: "대시보드", href: "/admin/store", icon: <LayoutDashboard size={16} /> },
        { label: "직원관리", href: "/admin/store/employees", icon: <Users size={16} /> },
        { label: "할일관리", href: "/admin/store/tasks", icon: <ListTodo size={16} /> },
        { label: "메뉴ON/OFF", href: "/admin/store/menu", icon: <UtensilsCrossed size={16} /> },
        { label: "판매현황", href: "/admin/store/sales", icon: <BarChart3 size={16} /> },
        { label: "발주내역", href: "/admin/store/orders", icon: <ShoppingCart size={16} /> },
        { label: "공지사항", href: "/admin/store/announcements", icon: <Megaphone size={16} /> },
      ],
    },
  ];

  const sections = role === "hq_admin" ? hqSections : storeSections;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[250px] z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1a1a1a" }}
      >
        {/* 로고 */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
          <Link href="/admin/hq" className="text-white font-bold text-sm tracking-wide">
            SCOOPS GELATO
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* 역할 배지 */}
        <div className="px-4 py-2 border-b border-gray-800 shrink-0">
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#D4A574]/20 text-[#D4A574] font-medium">
            {role === "hq_admin" ? "🏢 본사 관리자" : role === "franchisee" ? "🏪 점주" : "👤 직원"}
          </span>
        </div>

        {/* 메뉴 섹션 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              pathname={pathname}
              onClose={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarSection({
  section,
  pathname,
  onClose,
}: {
  section: MenuSection;
  pathname: string;
  onClose: () => void;
}) {
  const hasActive = section.items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));
  const [isOpen, setIsOpen] = useState(section.defaultOpen || hasActive);

  return (
    <div className="px-2 mb-1">
      {/* 섹션 헤더 (클릭하면 접기/펼치기) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {section.icon}
          <span className="text-[11px] font-semibold uppercase tracking-wide">{section.title}</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* 메뉴 아이템 */}
      {isOpen && (
        <div className="mt-0.5 space-y-0.5 ml-2">
          {section.items.map((item) => {
            const isCurrent = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-[13px] ${
                  isCurrent
                    ? "text-[#D4A574] bg-[#D4A574]/10 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
