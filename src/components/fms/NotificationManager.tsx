"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, Download } from "lucide-react";

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
  createdAt: string;
}

// ============================================
// 알림 매니저 — PWA 설치 안내 + 인앱 알림
// ============================================
export default function NotificationManager() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [showPWAGuide, setShowPWAGuide] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const prevCountRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 알림 소리
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  // Service Worker 등록 + 알림 권한 요청
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    // 알림 권한 확인
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // PWA 설치 여부 확인 — 미설치 시 안내 배너
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (!isStandalone && !sessionStorage.getItem("pwa_guide_dismissed")) {
      setTimeout(() => setShowPWAGuide(true), 3000);
    }
  }, []);

  // 알림 권한 요청
  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  // 폴링으로 새 알림 확인 (공지사항, 할일, 발주)
  useEffect(() => {
    let active = true;

    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/fms/announcements?limit=1", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const announcements = data.announcements || [];

        // 새 공지가 있으면 알림
        const newCount = announcements.length;
        const prevCount = prevCountRef.current.announcements || 0;

        if (prevCount > 0 && newCount > prevCount) {
          const latest = announcements[0];
          const notif: InAppNotification = {
            id: "ann_" + Date.now(),
            title: "📢 새 공지사항",
            body: latest.title || "새로운 공지가 등록되었습니다.",
            url: "/admin/store/announcements",
            createdAt: new Date().toISOString(),
          };
          setNotifications(prev => [notif, ...prev].slice(0, 10));
          setShowBanner(true);
          playSound();

          // 브라우저 푸시 알림도 발송
          if (permission === "granted") {
            new Notification(notif.title, { body: notif.body, icon: "/images/icon-192.png", tag: "scoops-" + notif.id });
          }

          // 5초 후 배너 자동 숨김
          setTimeout(() => setShowBanner(false), 5000);
        }
        prevCountRef.current.announcements = newCount;
      } catch {}
    };

    // 30초마다 체크
    checkNotifications();
    const interval = setInterval(() => { if (active) checkNotifications(); }, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [permission, playSound]);

  // PWA 설치 안내 닫기
  const dismissPWAGuide = () => {
    setShowPWAGuide(false);
    sessionStorage.setItem("pwa_guide_dismissed", "true");
  };

  return (
    <>
      {/* 인앱 알림 배너 (상단) */}
      {showBanner && notifications.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9999] p-3 animate-slide-down">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center flex-shrink-0">
              <Bell size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{notifications[0].title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{notifications[0].body}</p>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-gray-300 hover:text-gray-500">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PWA 설치 안내 (하단) */}
      {showPWAGuide && (
        <div className="fixed bottom-20 left-3 right-3 z-[9998] animate-slide-up">
          <div className="max-w-md mx-auto bg-[#1B4332] rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">홈 화면에 추가하세요!</p>
                <p className="text-xs text-white/70 mt-1">
                  알림을 받으려면 홈 화면에 추가해야 합니다.
                </p>
                <div className="mt-2 text-xs text-white/80 space-y-1">
                  <p>📱 <strong>아이폰:</strong> 하단 공유 버튼(⬆️) → &quot;홈 화면에 추가&quot;</p>
                  <p>📱 <strong>안드로이드:</strong> 메뉴(⋮) → &quot;홈 화면에 추가&quot;</p>
                </div>
              </div>
              <button onClick={dismissPWAGuide} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>
            {permission === "default" && (
              <button onClick={requestPermission}
                className="mt-3 w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                🔔 알림 허용하기
              </button>
            )}
            {permission === "granted" && (
              <p className="mt-2 text-xs text-green-300 text-center">✅ 알림이 허용되었습니다</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
