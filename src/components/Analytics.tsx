"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// ── 세션 ID 관리 ──
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("scoops_sid");
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem("scoops_sid", sid);
  }
  return sid;
}

// ── 페이지 방문 기록 (sessionStorage에 여정 저장) ──
interface PageVisitLocal {
  page: string;
  enterAt: string;
  dwellSec: number;
}

function getJourney(): PageVisitLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("scoops_journey");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJourney(journey: PageVisitLocal[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("scoops_journey", JSON.stringify(journey));
}

// ── 세션 완료 전송 (쓰로틀: 30초에 한 번만) ──
let lastSentAt = 0;

function sendSessionComplete() {
  // 개발환경은 전송 안 함
  if (process.env.NODE_ENV !== "production") return;
  // 관리자 기기는 전송 안 함
  if (typeof document !== "undefined" && document.cookie.includes("scoops_admin=true")) return;

  const now = Date.now();
  // 30초 이내 중복 전송 방지
  if (now - lastSentAt < 30000) return;
  lastSentAt = now;

  const journey = getJourney();
  if (journey.length === 0) return;

  // 마지막 페이지 체류시간 계산
  const last = journey[journey.length - 1];
  if (last && last.dwellSec === 0) {
    last.dwellSec = Math.round(
      (Date.now() - new Date(last.enterAt).getTime()) / 1000
    );
  }

  const sessionId = getSessionId();
  const payload = {
    type: "session_complete",
    sessionId,
    referrer: sessionStorage.getItem("scoops_referrer") || "",
    pages: journey,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("/api/admin/analytics", blob);
}

export default function Analytics() {
  const pathname = usePathname();
  const pageEnterTime = useRef<number>(Date.now());
  const currentPage = useRef<string>("");

  const recordDwell = useCallback(() => {
    const journey = getJourney();
    if (journey.length > 0) {
      const last = journey[journey.length - 1];
      if (last && last.dwellSec === 0) {
        last.dwellSec = Math.round(
          (Date.now() - pageEnterTime.current) / 1000
        );
        saveJourney(journey);
      }
    }
  }, []);

  // 페이지 변경 추적
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    // QR 주문 페이지는 방문자 통계에서 분리
    if (pathname.startsWith("/order")) return;
    // 개발환경은 추적 안 함
    if (process.env.NODE_ENV !== "production") return;
    // 봇/크롤러 제외
    if (typeof navigator !== "undefined" && /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|Baidu|DuckDuckBot|facebookexternalhit|LinkedInBot|Twitterbot|WhatsApp|Bytespider|GPTBot|ClaudeBot/i.test(navigator.userAgent)) return;
    // 관리자 기기는 추적 제외
    if (document.cookie.includes("scoops_admin=true")) return;

    if (currentPage.current && currentPage.current !== pathname) {
      recordDwell();
    }

    currentPage.current = pathname;
    pageEnterTime.current = Date.now();

    const journey = getJourney();
    journey.push({
      page: pathname,
      enterAt: new Date().toISOString(),
      dwellSec: 0,
    });
    saveJourney(journey);

    if (journey.length === 1) {
      sessionStorage.setItem("scoops_referrer", document.referrer || "");
    }

    // 개별 페이지뷰 전송
    const sessionId = getSessionId();
    fetch("/api/admin/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview", page: pathname, referrer: document.referrer || "", sessionId }),
    }).catch(() => {});

    // Supabase visit_logs에도 기록 (IP 지역 분석용)
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname, recordDwell]);

  // 페이지 떠날 때만 세션 완료 전송
  useEffect(() => {
    const handleBeforeUnload = () => {
      recordDwell();
      sendSessionComplete();
    };

    // visibilitychange: hidden일 때만 (쓰로틀 적용됨)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordDwell();
        sendSessionComplete();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [recordDwell]);

  return null;
}
