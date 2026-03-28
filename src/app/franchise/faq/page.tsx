"use client";

import { useState } from "react";
import Link from "next/link";
import SubNav from "@/components/SubNav";

const faqData = [
  {
    q: "젤라또 제조 경험이 없어도 창업이 가능한가요?",
    a: "네, 가능합니다. 본사에서 2주간 체계적인 교육 프로그램을 제공하며, 젤라또 제조부터 매장 운영까지 전 과정을 배우실 수 있습니다. 오픈 초기에는 본사 SV가 매장에 상주하여 안정적인 운영을 돕습니다.",
  },
  {
    q: "가맹점 창업 시 총 투자비용은 얼마인가요?",
    a: "10평 기준 약 4,850만원~입니다. 가맹비 0원, 교육비, 인테리어, 장비, 초도물량 등이 포함됩니다. 매장 규모와 지역에 따라 달라질 수 있으며, 자세한 비용은 개설비용 페이지에서 확인하실 수 있습니다.",
  },
  {
    q: "매장 운영에 필요한 인력은 몇 명인가요?",
    a: "10평 기준 점주 포함 1~2명이면 운영 가능합니다. 피크 시간대에는 추가 인력이 필요할 수 있으며, 본사에서 효율적인 인력 운영 방안을 안내해 드립니다.",
  },
  {
    q: "원재료 공급은 어떻게 이루어지나요?",
    a: "본사에서 주 2~3회 정기적으로 원재료를 공급합니다. 젤라또 베이스, 과일 퓨레, 토핑류 등 핵심 원재료는 본사가 직접 소싱하여 품질을 관리하고 있습니다.",
  },
  {
    q: "상권 분석도 도와주시나요?",
    a: "네. 가맹 상담 시 희망 지역의 상권을 분석해 드립니다. 유동인구, 주변 상권, 경쟁업체 현황, 접근성 등을 종합적으로 검토하여 최적의 입지를 함께 선정합니다.",
  },
  {
    q: "로열티가 있나요?",
    a: "월 정액 로열티가 있습니다. 자세한 금액은 가맹 상담 시 안내드리며, 본사의 지속적인 마케팅 지원, 신메뉴 개발, SV 방문 관리 등의 서비스가 포함됩니다.",
  },
  {
    q: "계약 기간은 어떻게 되나요?",
    a: "기본 계약 기간은 3년이며, 쌍방 합의 하에 재계약이 가능합니다. 재계약 시 별도의 가맹비는 발생하지 않습니다.",
  },
  {
    q: "매출이 부진할 경우 지원이 있나요?",
    a: "본사 SV가 정기적으로 매장을 방문하여 매출 분석 및 개선 방안을 함께 모색합니다. 프로모션 지원, 메뉴 컨설팅, 마케팅 지원 등 다각도로 도움을 드리고 있습니다.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left"
      >
        <span className="text-sm md:text-base font-medium text-brand-primary pr-4">{q}</span>
        <svg
          className={`w-5 h-5 text-brand-secondary shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[400px] pb-6" : "max-h-0"}`}>
        <p className="text-sm text-text-body leading-relaxed pl-0">{a}</p>
      </div>
    </div>
  );
}

export default function FranchiseFAQPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="FRANCHISE" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">FAQ</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">가맹문의 Q&A</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            가맹 창업에 대해 자주 묻는 질문을 모았습니다.
          </p>
        </div>
      </section>

      {/* FAQ 리스트 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          {faqData.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* 추가 문의 CTA */}
      <section className="bg-bg-cream py-20">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2 className="text-xl font-light text-brand-primary mb-4">더 궁금한 점이 있으신가요?</h2>
          <p className="text-sm text-text-body mb-8">
            위에 없는 질문이 있으시다면 가맹 상담을 통해 자세히 안내드리겠습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/franchise/inquiry" className="btn-filled rounded-xl px-10 py-4">가맹 상담 신청</Link>
            <a href="tel:18110259" className="btn-outline rounded-xl px-10 py-4">1811-0259</a>
          </div>
        </div>
      </section>
    </main>
  );
}
