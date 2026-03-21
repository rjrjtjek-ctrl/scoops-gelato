"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 관리자 페이지는 추적 제외
    if (pathname.startsWith("/admin")) return;
    // 주문 페이지는 별도 tracking.ts로 추적 — 여기서 제외
    if (pathname.startsWith("/order")) return;
    // 관리자 기기 제외 (POS에서 scoops_admin 쿠키 설정됨)
    if (document.cookie.includes("scoops_admin=true")) return;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
