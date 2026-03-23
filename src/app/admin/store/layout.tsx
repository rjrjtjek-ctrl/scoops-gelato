"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/fms/AdminSidebar";
import AdminHeader from "@/components/fms/AdminHeader";
import { ArrowLeft } from "lucide-react";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; storeName: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/fms/auth/me", { cache: "no-store" });
        if (!res.ok) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.user.role !== "franchisee" && data.user.role !== "hq_admin") { router.push("/admin/login"); return; }
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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <AdminSidebar role="franchisee" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[250px]">
        {/* 본사가 점주 페이지를 열람 중일 때 상단 안내 */}
        {isHQViewing && (
          <div className="bg-[#1B4332] text-white px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#D4A574]">🏪</span>
              <span>점주 기능을 열람 중입니다</span>
            </div>
            <Link href="/admin/hq" className="flex items-center gap-1 text-[#D4A574] hover:text-white text-xs">
              <ArrowLeft size={14} /> 본사로 돌아가기
            </Link>
          </div>
        )}
        <AdminHeader
          title={isHQViewing ? "점주 기능 열람" : `${user.storeName || "매장"} 관리`}
          userName={user.name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
