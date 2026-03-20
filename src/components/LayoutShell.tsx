"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import VideoPopup from "@/components/VideoPopup";
import AnalysisPopup from "@/components/AnalysisPopup";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isOrder = pathname.startsWith("/order");

  if (isAdmin || isOrder) {
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
    </>
  );
}
