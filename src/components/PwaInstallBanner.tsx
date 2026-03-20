"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";
import { track } from "@/lib/tracking";

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 PWA로 실행 중이면 숨김
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isInstalled) return;

    // "다음에 하기" 3일 체크
    const dismissDate = localStorage.getItem("pwa_dismiss_date");
    if (dismissDate) {
      const diff = Date.now() - parseInt(dismissDate, 10);
      if (diff < 3 * 24 * 60 * 60 * 1000) return; // 3일 안 지남
    }

    // iOS 판별
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // 약간의 딜레이 후 표시 (주문 완료 화면 확인 후)
    const timer = setTimeout(() => { setShow(true); track("pwa_banner"); }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInstallAndroid = async () => {
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") {
        // 설치 통계 기록
        fetch("/api/pwa-install", { method: "POST" }).catch(() => {});
        track("pwa_install");
      }
      window.__pwaInstallPrompt = null;
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_dismiss_date", String(Date.now()));
    setShow(false);
    track("pwa_dismiss");
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[80] flex justify-center"
      >
        <div className="w-full max-w-[480px] mx-4 mb-[max(env(safe-area-inset-bottom,20px),20px)]">
          <div className="bg-white rounded-2xl shadow-xl border border-[#EDE6DD] p-5 mb-2">
            {/* 닫기 */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#BBB]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-[#1B4332] rounded-xl flex items-center justify-center flex-shrink-0">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#2A2A2A]">
                  다음 주문은 더 빠르게!
                </p>
                <p className="text-xs text-[#999]">
                  홈화면에 추가하면 앱처럼 바로 열어요
                </p>
              </div>
            </div>

            {isIOS ? (
              /* iOS 가이드 */
              <div className="bg-[#F5F0EB] rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="space-y-3 text-[13px] text-[#555]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>하단 <Share size={14} className="inline -mt-0.5 text-[#007AFF]" /> 공유 버튼 탭</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>&quot;홈 화면에 추가&quot; 선택</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Android 설치 버튼 */
              <button
                onClick={handleInstallAndroid}
                className="w-full py-3.5 bg-[#1B4332] text-white rounded-xl text-sm font-bold mb-3 active:scale-[0.98] transition-transform"
              >
                홈화면에 추가하기
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full text-center text-[13px] text-[#999] py-1"
            >
              다음에 하기
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
