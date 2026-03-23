"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 로그인 페이지에서는 숨김
  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* 채팅 창 */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-[56px] h-[56px] rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: isOpen ? "#333" : "#D4A574" }}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>
    </>
  );
}
