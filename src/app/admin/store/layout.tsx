"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/fms/AdminSidebar";
import AdminHeader from "@/components/fms/AdminHeader";
import {
  ArrowLeft, LayoutDashboard, Users, ListTodo,
  UtensilsCrossed, ShoppingCart, BarChart3, Megaphone
} from "lucide-react";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; storeName: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/fms/auth/me", { cache: "no-store" });
        if (!res.ok) { router.push("/store/login"); return; }
        const data = await res.json();
        if (data.user.role !== "franchisee" && data.user.role !== "hq_admin") { router.push("/store/login"); return; }
        setUser(data.user);
      } catch { router.push("/store/login"); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]"><div className="text-gray-400 text-sm">로딩 중...</div></div>;
  }
  if (!user) return null;

  const isHQViewing = user.role === "hq_admin";

  // 점주용 하단 탭바
  const storeTabs = [
    { href: "/admin/store", icon: <LayoutDashboard size={20} />, label: "홈" },
    { href: "/admin/store/employees", icon: <Users size={20} />, label: "직원" },
    { href: "/admin/store/tasks", icon: <ListTodo size={20} />, label: "할일" },
    { href: "/admin/store/menu", icon: <UtensilsCrossed size={20} />, label: "메뉴" },
    { href: "/admin/store/sales", icon: <BarChart3 size={20} />, label: "매출" },
  ];

  // 본사 열람 시: 데스크탑 사이드바 + "본사로 돌아가기"
  if (isHQViewing) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <AdminSidebar role="franchisee" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-[250px]">
          <div className="bg-[#1B4332] text-white px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#D4A574]">🏪</span>
              <span>점주 기능을 열람 중입니다</span>
            </div>
            <Link href="/admin/hq" className="flex items-center gap-1 text-[#D4A574] hover:text-white text-xs">
              <ArrowLeft size={14} /> 본사로 돌아가기
            </Link>
          </div>
          <AdminHeader title="점주 기능 열람" userName={user.name} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    );
  }

  // 점주 본인: 모바일 전용 UI (하단 탭바)
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      <AdminHeader
        title={user.storeName || "매장 관리"}
        userName={user.name}
        showMenu={false}
        logoutRedirect="/store/login"
      />
      <main className="p-4 pb-24 max-w-lg mx-auto">{children}</main>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-lg mx-auto flex">
          {storeTabs.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex-1 flex flex-col items-center py-2 text-[10px] ${isActive ? "text-[#1B4332] font-bold" : "text-gray-400"}`}>
                {tab.icon}
                <span className="mt-0.5">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 추가 메뉴는 대시보드 페이지(page.tsx)에서 렌더링 — 중복 방지 */}
    </div>
  );
}
