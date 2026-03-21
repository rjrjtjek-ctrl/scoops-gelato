import Link from "next/link";
import SubNav from "@/components/SubNav";

const costItems = [
  { category: "가맹비", amount: "500만원", desc: "브랜드 사용권, 노하우 전수, 교육비 포함" },
  { category: "교육비", amount: "포함", desc: "가맹비에 포함 (2주 교육 프로그램)" },
  { category: "보증금", amount: "300만원", desc: "계약 종료 시 반환 (위약 시 공제)" },
  { category: "인테리어", amount: "3,500만원~", desc: "15평 기준, 평당 약 230만원 (면적에 따라 변동)" },
  { category: "장비·설비", amount: "2,000만원~", desc: "젤라또 쇼케이스, 배치프리저, 커피머신 등" },
  { category: "초도물량", amount: "500만원~", desc: "원재료, 포장재, 소모품 등 초기 물량" },
  { category: "기타 비용", amount: "200만원~", desc: "간판, POS, 소방·전기 등 기타 설비" },
];

export default function FranchiseCostPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="FRANCHISE" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Investment</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">가맹점 개설비용</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            투명하게 공개하는 스쿱스젤라또 가맹 창업 비용입니다.
          </p>
        </div>
      </section>

      {/* 비용 테이블 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="bg-bg-cream rounded-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-brand-primary text-white text-sm font-medium">
              <span>항목</span>
              <span>금액</span>
              <span>비고</span>
            </div>

            {/* 행 */}
            {costItems.map((item, i) => (
              <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-5 text-sm ${i % 2 === 0 ? "bg-bg-cream" : "bg-bg-white"}`}>
                <span className="font-medium text-brand-primary">{item.category}</span>
                <span className="text-brand-secondary font-medium">{item.amount}</span>
                <span className="text-text-body text-xs leading-relaxed">{item.desc}</span>
              </div>
            ))}

            {/* 총합 */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 bg-brand-primary/5 border-t border-brand-primary/10">
              <span className="font-medium text-brand-primary text-sm">총 예상 투자비</span>
              <span className="text-brand-primary font-semibold text-lg col-span-2">약 7,000만원~</span>
            </div>
          </div>

          <p className="text-xs text-text-light mt-4 text-center">
            * 위 금액은 15평(약 50㎡) 기준 예상 금액이며, 매장 규모·지역·인테리어 마감재 등에 따라 달라질 수 있습니다.
            <br />* 부가세 별도. 상세 비용은 가맹 상담 시 안내드립니다.
          </p>
        </div>
      </section>

      {/* 본사 지원 사항 */}
      <section className="bg-bg-cream section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Support</p>
            <h2 className="text-2xl md:text-3xl font-light text-brand-primary">본사 지원 사항</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "레시피 & 교육", value: "전 과정", sub: "젤라또 제조부터 매장 운영까지 체계적 교육" },
              { label: "마케팅 지원", value: "본사 주도", sub: "SNS, 프로모션, 시즌 마케팅 지원" },
              { label: "지속 관리", value: "정기 방문", sub: "품질 관리, 신메뉴 개발, 운영 컨설팅" },
            ].map((item, i) => (
              <div key={i} className="bg-bg-white rounded-2xl p-8 text-center">
                <p className="text-sm text-text-body mb-3">{item.label}</p>
                <p className="text-2xl font-light text-brand-primary mb-2">{item.value}</p>
                <p className="text-xs text-text-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-white py-20">
        <div className="text-center">
          <p className="text-text-body mb-6">자세한 비용 상담을 원하시나요?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/franchise/inquiry" className="btn-filled rounded-xl px-10 py-4">가맹 상담 신청</Link>
            <a href="tel:18110259" className="btn-outline rounded-xl px-10 py-4">1811-0259 전화 상담</a>
          </div>
        </div>
      </section>
    </main>
  );
}
