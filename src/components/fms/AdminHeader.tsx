"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, Bell } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  userName: string;
  onMenuToggle: () => void;
}

export default function AdminHeader({ title, userName, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/fms/auth/logout", { method: "POST" });
      localStorage.removeItem("fms_token");
      sessionStorage.removeItem("fms_token");
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* 좌측: 햄버거 + 타이틀 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-sm lg:text-base font-bold text-gray-800">{title}</h1>
      </div>

      {/* 우측: 알림 + 사용자 + 로그아웃 */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={18} className="text-gray-500" />
        </button>
        <span className="text-sm text-gray-600 hidden sm:inline">{userName}</span>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="로그아웃"
        >
          <LogOut size={18} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
