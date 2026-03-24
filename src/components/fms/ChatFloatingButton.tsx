"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 로그인 페이지에서는 숨김
  if (pathname === "/admin/login" || pathname === "/store/login" || pathname === "/staff/login") return null;

  // 점주/직원 페이지에서는 하단 탭바 위로 올림
  const isStoreOrStaff = pathname.startsWith("/admin/store") || pathname.startsWith("/admin/staff");

  return (
    <>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 z-[9990] w-[52px] h-[52px] rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
          isStoreOrStaff ? "bottom-[calc(88px+env(safe-area-inset-bottom,0px))]" : "bottom-6"
        }`}
        style={{ backgroundColor: isOpen ? "#333" : "#D4A574" }}
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={20} className="text-white" />
        )}
      </button>
    </>
  );
}
