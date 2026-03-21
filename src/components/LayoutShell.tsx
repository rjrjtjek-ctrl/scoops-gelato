"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import VideoPopup from "@/components/VideoPopup";
import AnalysisPopup from "@/components/AnalysisPopup";

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
