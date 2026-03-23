"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/fms/AdminHeader";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/fms/auth/me", { cache: "no-store" });
        if (!res.ok) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.user.role !== "employee") { router.push("/admin/login"); return; }
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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <AdminHeader
        title="SCOOPS GELATO"
        userName={user.name}
        onMenuToggle={() => {}}
      />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">{children}</main>
    </div>
  );
}
