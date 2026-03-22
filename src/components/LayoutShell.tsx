"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import VideoPopup from "@/components/VideoPopup";
import AnalysisPopup from "@/components/AnalysisPopup";

// 주문번호 배너 — 주문 후 공식홈페이지 방문 시 표시
function OrderBanner() {
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string; storeCode: string } | null>(null);

  useEffect(() => {
    try {
      const orderNumber = sessionStorage.getItem("scoops_last_order");
      const storeCode = sessionStorage.getItem("scoops_last_store");
      if (orderNumber && storeCode) {
        setOrderInfo({ orderNumber, storeCode });
      }
    } catch {}
  }, []);

  if (!orderInfo) return null;

  return (
    <div className="w-full bg-[#1B4332] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link
          href={`/order/${orderInfo.storeCode}`}
          className="flex items-center gap-2"
        >
          <span className="text-white/70 text-xs">내 주문번호</span>
          <span className="font-black text-base tracking-wider">{orderInfo.orderNumber}</span>
          <span className="text-white/50 text-[10px]">터치하여 주문 보기 →</span>
        </Link>
        <button
          onClick={() => {
            try { sessionStorage.removeItem("scoops_last_order"); sessionStorage.removeItem("scoops_last_store"); } catch {}
            setOrderInfo(null);
          }}
          className="text-white/40 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// 모바일 하단 가맹 CTA 바
function MobileFranchiseCTA({ pathname }: { pathname: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 특정 경로에서 숨김
  if (pathname.startsWith("/franchise/landing") || pathname.startsWith("/order") || pathname.startsWith("/admin")) return null;

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden safe-area-bottom">
      <Link
        href="/franchise/landing"
        className="flex items-center justify-center w-full h-14 bg-[#1B4332] text-white font-bold text-[15px] tracking-wide active:bg-[#2D6A4F] transition-colors"
      >
        가맹비 0원 상담받기
      </Link>
    </div>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isOrder = pathname.startsWith("/order");
  const isLanding = pathname === "/franchise/landing";

  if (isAdmin || isOrder || isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <OrderBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
      {pathname === "/" && <VideoPopup />}
      <AnalysisPopup />
      {/* 모바일 가맹 플로팅 CTA — 모바일에서만, 특정 경로 제외 */}
      <MobileFranchiseCTA pathname={pathname} />
    </>
  );
}
