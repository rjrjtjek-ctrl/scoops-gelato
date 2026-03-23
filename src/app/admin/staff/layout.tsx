"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/fms/AdminHeader";
import { ArrowLeft, ClipboardList, Megaphone, UtensilsCrossed, ShoppingCart, Home } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/fms/auth/me", { cache: "no-store" });
        if (!res.ok) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.user.role !== "employee" && data.user.role !== "hq_admin") { router.push("/admin/login"); return; }
        setUser(data.user);
      } catch { router.push("/admin/login"); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]"><div className="text-gray-400 text-sm">로딩 중...</div></div>;
  }
  if (!user) return null;

  const isHQViewing = user.role === "hq_admin";

  const tabs = [
    { href: "/admin/staff", icon: <Home size={20} />, label: "홈" },
    { href: "/admin/staff/tasks", icon: <ClipboardList size={20} />, label: "할일" },
    { href: "/admin/staff/announcements", icon: <Megaphone size={20} />, label: "공지" },
    { href: "/admin/staff/menu", icon: <UtensilsCrossed size={20} />, label: "메뉴" },
    { href: "/admin/staff/orders", icon: <ShoppingCart size={20} />, label: "발주" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      {isHQViewing && (
        <div className="bg-[#2D6A4F] text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>직원 화면을 열람 중입니다</span>
          </div>
          <Link href="/admin/hq" className="flex items-center gap-1 text-[#D4A574] hover:text-white text-xs">
            <ArrowLeft size={14} /> 본사로 돌아가기
          </Link>
        </div>
      )}
      <AdminHeader
        title={isHQViewing ? "직원 화면 열람" : "SCOOPS GELATO"}
        userName={user.name}
        onMenuToggle={() => {}}
      />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">{children}</main>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
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
    </div>
  );
}
