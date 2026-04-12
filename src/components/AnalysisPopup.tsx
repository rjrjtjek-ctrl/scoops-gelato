"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, BarChart3, ArrowRight } from "lucide-react";
// framer-motion AnimatePresence 제거 — exit 애니메이션 후 DOM 잔류 버그로 스크롤 차단됨

export default function AnalysisPopup() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 하루에 한 번만 표시 (24시간 기준)
    const lastShown = localStorage.getItem("scoops_analysis_popup");
    const now = Date.now();
    if (lastShown && now - Number(lastShown) < 24 * 60 * 60 * 1000) return;

    // 홈페이지에서는 VideoPopup이 먼저 뜨므로 좀 더 늦게 표시
    // 다른 페이지에서는 1.5초 후 바로 표시
    const delay = pathname === "/" ? 5000 : 1500;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("scoops_analysis_popup", String(Date.now()));
  };

  const handleGo = () => {
    localStorage.setItem("scoops_analysis_popup", String(Date.now()));
    window.open("https://www.xn--ok0bz3ittr.kr/", "_blank", "noopener,noreferrer");
    setShow(false);
  };

  // 팝업이 닫히면 즉시 DOM에서 제거 — AnimatePresence 제거로 유령 오버레이 방지
  if (!show) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-fadeIn"
        onClick={handleClose}
      />

      {/* 팝업 */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[92%] max-w-[420px] animate-scaleIn"
      >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* 상단 그라데이션 헤더 */}
              <div className="relative bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-7 pt-8 pb-6">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#A68B5B]/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[#A68B5B]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/50 tracking-wider uppercase">Scoops × AI</p>
                    <p className="text-base font-bold text-white">AI 상권분석</p>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white leading-[1.4]">
                  스쿱스젤라또가 만든<br />
                  <span className="text-[#A68B5B]">AI 상권분석 &ldquo;여기돼?&rdquo;</span>
                </h2>
              </div>

              {/* 본문 */}
              <div className="px-7 py-6">
                <p className="text-sm text-[#5C6B63] leading-[1.9] mb-5">
                  창업을 고민 중이신가요? 주소만 입력하면 AI가 상권을 분석해드립니다.
                  업종별 맞춤 분석, 경쟁점 파악, 리스크 사전 경고까지 —
                  <strong className="text-[#1B4332]">무료</strong>로 이용하실 수 있습니다.
                </p>

                <div className="flex items-center gap-3 bg-[#FAFAF5] rounded-xl p-4 mb-6 border border-black/5">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-xs font-semibold text-[#1B4332]">주소만 입력하세요</p>
                    <p className="text-xs text-[#5C6B63]">3초 만에 AI 상권분석 리포트를 받아보세요</p>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <button
                  onClick={handleGo}
                  className="w-full flex items-center justify-center gap-2 bg-[#A68B5B] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#A68B5B]/85 transition-colors duration-200"
                >
                  무료 상권분석 시작하기
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClose}
                  className="w-full text-center text-xs text-[#5C6B63]/60 mt-3 py-1 hover:text-[#5C6B63] transition-colors"
                >
                  다음에 볼게요
                </button>
              </div>
            </div>
          </div>
        </>
  );
}
