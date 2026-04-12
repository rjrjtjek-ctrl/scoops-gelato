"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "scoops_video_popup_dismiss";

export default function VideoPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = Number(dismissed);
      if (dismissedAt > Date.now() - 24 * 60 * 60 * 1000) return;
    }
    // 1초 후에 팝업 표시 (페이지 로딩 후)
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setShow(false);

  const handleDismissToday = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  // 팝업이 닫히면 즉시 DOM에서 제거 — AnimatePresence 제거로 유령 오버레이 방지
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* popup */}
      <div
        className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-[560px] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 영상 */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src="https://www.youtube.com/embed/EopgbtKIO_M"
            title="스쿱스 젤라떼리아 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={handleDismissToday}
            className="flex-1 py-3.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            오늘 하루 그만보기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
