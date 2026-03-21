"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ScrollToTop from "@/components/ScrollToTop";
import VisitTracker from "@/components/VisitTracker";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {children}
        <VisitTracker />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
      <ScrollToTop />
      <VisitTracker />
    </>
  );
}
