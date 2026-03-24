"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  userName: string;
  onMenuToggle?: () => void;
  showMenu?: boolean;
  logoutRedirect?: string;
}

export default function AdminHeader({ title, userName, onMenuToggle, showMenu = true, logoutRedirect = "/admin/login" }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/fms/auth/logout", { method: "POST" });
      localStorage.removeItem("fms_token");
      sessionStorage.removeItem("fms_token");
      router.push(logoutRedirect);
    } catch {
      router.push(logoutRedirect);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {showMenu && onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
        <h1 className="text-sm font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{userName}</span>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg" title="로그아웃">
          <LogOut size={16} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
