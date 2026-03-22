"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 봇 필터링 (클라이언트 사이드)
const BOT_PATTERN = /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|Baidu|DuckDuckBot|facebookexternalhit|LinkedInBot|Twitterbot|WhatsApp|Bytespider|GPTBot|ClaudeBot|SemrushBot|AhrefsBot|MJ12bot|DotBot|PetalBot|HeadlessChrome|PhantomJS|Selenium|puppeteer/i;

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 관리자 페이지는 추적 제외
    if (pathname.startsWith("/admin")) return;
    // 관리자 기기 제외 (POS에서 scoops_admin 쿠키 설정됨)
    if (document.cookie.includes("scoops_admin=true")) return;
    // 봇 필터링
    if (BOT_PATTERN.test(navigator.userAgent)) return;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
