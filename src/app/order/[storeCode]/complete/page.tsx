"use client";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

function CompleteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeCode = params.storeCode as string;

  const orderNumber = searchParams.get("orderNumber") || "---";
  const orderType = searchParams.get("type") || "dine_in";
  const isDineIn = orderType === "dine_in";

  return (
    <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center">
      <main className="w-full max-w-[480px] flex-1 px-5 flex flex-col items-center justify-center">
        {/* 체크 아이콘 */}
        <div className="w-20 h-20 rounded-full bg-[#1B4332]/10 flex items-center justify-center mb-6">
          <CheckCircle2 size={44} className="text-[#1B4332]" />
        </div>

        <h1 className="text-xl font-bold text-[#2A2A2A] mb-2">주문 완료!</h1>

        {/* 주문번호 */}
        <div className="bg-white rounded-2xl px-8 py-6 text-center shadow-sm border border-[#EDE6DD]/60 mb-6 w-full">
          <p className="text-xs text-[#999] mb-1">주문번호</p>
          <p className="text-4xl font-black text-[#1B4332] tracking-wider">
            {orderNumber}
          </p>
        </div>

        {/* 안내 */}
        {isDineIn ? (
          <div className="bg-[#1B4332]/5 rounded-2xl px-5 py-4 text-center mb-8 w-full">
            <p className="text-sm text-[#1B4332] font-medium leading-relaxed">
              나가실 때 카운터에서
              <br />
              주문번호를 말씀해주세요
            </p>
          </div>
        ) : (
          <div className="bg-[#1B4332]/5 rounded-2xl px-5 py-4 text-center mb-8 w-full">
            <p className="text-sm text-[#1B4332] font-medium">
              결제가 완료되었습니다
            </p>
            <p className="text-xs text-[#555] mt-1">
              준비가 완료되면 카운터에서 픽업해주세요
            </p>
          </div>
        )}

        {/* 브랜드 링크 */}
        <div className="w-full bg-white rounded-2xl p-5 border border-[#EDE6DD]/60 mb-4">
          <p className="text-sm font-semibold text-[#2A2A2A] text-center mb-4">
            스쿱스젤라또가 궁금하신가요?
          </p>
          <div className="space-y-2">
            <Link
              href="/story"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] text-sm text-[#2A2A2A] font-medium hover:bg-[#EDE6DD] transition-colors"
            >
              브랜드 스토리 보기
              <ArrowRight size={16} className="text-[#999]" />
            </Link>
            <Link
              href="/franchise"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] text-sm text-[#2A2A2A] font-medium hover:bg-[#EDE6DD] transition-colors"
            >
              가맹 사업 알아보기
              <ArrowRight size={16} className="text-[#999]" />
            </Link>
          </div>
        </div>

        {/* 새 주문 */}
        <Link
          href={`/order/${storeCode}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[#1B4332] text-[#1B4332] text-sm font-bold mt-2 mb-10 hover:bg-[#1B4332]/5 transition-colors"
        >
          <RotateCcw size={16} />
          새 주문하기
        </Link>
      </main>

      {/* PWA 설치 유도 배너 */}
      <PwaInstallBanner />
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#FDFBF8] flex items-center justify-center">
          <div className="text-[#999] text-sm">로딩 중...</div>
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
