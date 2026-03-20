"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function FloatingButtons() {
  const pathname = usePathname();

  // 관리자 페이지에서는 숨김
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* 가맹문의 */}
      <Link
        href="/franchise#inquiry"
        className="bg-brand-secondary text-white text-[13px] font-semibold tracking-wide px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center whitespace-nowrap"
      >
        가맹문의
      </Link>
      {/* 업종변경 */}
      <Link
        href="/franchise/conversion"
        className="bg-[#A68B5B] text-white text-[13px] font-semibold tracking-wide px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center whitespace-nowrap flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        업종변경
      </Link>
      {/* 매장찾기 */}
      <Link
        href="/stores"
        className="bg-brand-primary text-white text-[13px] font-semibold tracking-wide px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center whitespace-nowrap"
      >
        매장찾기
      </Link>
    </div>
  );
}
