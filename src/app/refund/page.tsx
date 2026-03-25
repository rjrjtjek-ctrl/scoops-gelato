import type { Metadata } from "next";
import SubNav from "@/components/SubNav";

export const metadata: Metadata = {
  title: "환불정책 | 스쿱스 젤라떼리아",
  description: "스쿱스 젤라떼리아 환불 및 취소 정책 안내. 매장 주문, 포장 주문, 온라인 결제 환불 절차를 안내합니다.",
  alternates: { canonical: "https://scoopsgelato.kr/refund" },
};

export default function RefundPage() {
  return (
    <>
      <SubNav category="CUSTOMER" />
      <div className="min-h-screen bg-[#FDF9F4]">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-24">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B4332] mb-2">환불 및 취소 정책</h1>
          <p className="text-sm text-[#999] mb-10">스쿱스 젤라떼리아 (SCOOPS GELATERIA)</p>

          <div className="space-y-10">
            {/* 1. 매장 주문 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                매장 주문 취소 및 환불
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">주문 접수 후 제조 시작 전:</strong> 전액 환불 가능</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">제조 시작 후:</strong> 환불 불가 (식품 위생법에 따라 제조된 식품은 반품/환불이 제한됩니다)</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">제품 하자(이물질 발견, 변질 등):</strong> 즉시 교환 또는 전액 환불</p>
                </div>
              </div>
            </section>

            {/* 2. 포장 주문 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                포장 주문 취소 및 환불
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">수령 전 취소:</strong> 전액 환불</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">수령 후:</strong> 제품 하자 시에만 교환 또는 환불 (수령 당일 내 매장에 알려주세요)</p>
                </div>
              </div>
            </section>

            {/* 3. 온라인 결제 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                온라인 결제 환불
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">카드 결제 취소:</strong> 결제일로부터 영업일 기준 3~5일 이내 환불 처리</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">계좌이체/가상계좌:</strong> 환불 계좌 확인 후 영업일 기준 3~5일 이내 입금</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">간편결제(토스페이 등):</strong> 결제 수단별 환불 정책에 따라 처리</p>
                </div>
              </div>
            </section>

            {/* 4. 환불 절차 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                환불 절차
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                {[
                  "매장 직원에게 직접 요청 또는 대표번호(1811-0259)로 연락",
                  "주문번호, 결제수단, 환불 사유 확인",
                  "확인 후 환불 처리 (카드 취소 또는 계좌 입금)",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-6 h-6 bg-[#F5F0EB] text-[#1B4332] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm text-[#555]">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. 환불 불가 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                환불 불가 사항
              </h2>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-3">
                {[
                  "고객 단순 변심으로 인한 제조 완료 제품",
                  "수령 후 보관 부주의로 인한 품질 변화",
                  "일부 소비한 제품",
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-red-400 font-bold text-sm mt-0.5">✕</span>
                    <p className="text-sm text-red-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. 문의 */}
            <section>
              <h2 className="text-lg font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                문의
              </h2>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">📞</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">대표번호:</strong> <a href="tel:1811-0259" className="text-[#1B4332] hover:underline">1811-0259</a></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">✉️</span>
                  <p className="text-sm text-[#555]"><strong className="text-[#2A2A2A]">이메일:</strong> <a href="mailto:scoopsgelato10@gmail.com" className="text-[#1B4332] hover:underline">scoopsgelato10@gmail.com</a></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#A68B5B] font-bold text-sm mt-0.5">🏪</span>
                  <p className="text-sm text-[#555]">영업시간 내 매장에서 직접 문의 가능</p>
                </div>
              </div>
            </section>
          </div>

          <p className="text-xs text-[#999] mt-10 text-center">본 정책은 2026년 3월 25일부터 적용됩니다.</p>
        </div>
      </div>
    </>
  );
}
