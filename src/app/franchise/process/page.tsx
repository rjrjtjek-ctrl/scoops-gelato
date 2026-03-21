import Link from "next/link";
import SubNav from "@/components/SubNav";

const steps = [
  {
    step: "01",
    title: "가맹 상담",
    desc: "전화 또는 온라인으로 가맹 상담을 신청합니다. 담당자가 브랜드 소개 및 가맹 조건을 안내해 드립니다.",
    duration: "1~3일",
  },
  {
    step: "02",
    title: "상권 분석",
    desc: "희망 지역의 상권을 분석하고, 최적의 입지를 함께 선정합니다. 유동인구, 주변 상권, 접근성 등을 종합적으로 검토합니다.",
    duration: "1~2주",
  },
  {
    step: "03",
    title: "가맹 계약",
    desc: "가맹 계약서를 검토하고 계약을 체결합니다. 정보공개서를 통해 투명한 가맹 조건을 확인하실 수 있습니다.",
    duration: "1주",
  },
  {
    step: "04",
    title: "인테리어 설계",
    desc: "스쿱스젤라또 본사의 인테리어 가이드에 맞춰 매장을 설계합니다. 브랜드 컨셉에 맞는 공간을 함께 만들어갑니다.",
    duration: "2~3주",
  },
  {
    step: "05",
    title: "교육 및 연수",
    desc: "젤라또 제조법, 매장 운영, 서비스 교육 등 체계적인 교육 프로그램을 진행합니다.",
    duration: "2주",
  },
  {
    step: "06",
    title: "인테리어 시공",
    desc: "설계안에 따라 인테리어 시공을 진행합니다. 장비 입고 및 설치도 함께 이루어집니다.",
    duration: "3~4주",
  },
  {
    step: "07",
    title: "최종 점검 및 오픈",
    desc: "본사 SV가 매장을 방문하여 최종 점검을 진행하고, 오픈을 함께 준비합니다.",
    duration: "1주",
  },
];

export default function FranchiseProcessPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="FRANCHISE" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Opening Process</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">가맹점 개설절차</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            상담부터 오픈까지, 스쿱스젤라또가 체계적으로 함께합니다.
          </p>
        </div>
      </section>

      {/* 절차 타임라인 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="space-y-0">
            {steps.map((item, i) => (
              <div key={i} className="flex gap-6 md:gap-10">
                {/* 왼쪽 타임라인 */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-medium">{item.step}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-brand-primary/20 min-h-[40px]" />}
                </div>

                {/* 오른쪽 내용 */}
                <div className="pb-12">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-brand-primary">{item.title}</h3>
                    <span className="text-[11px] bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded-full">
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-sm text-text-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 총 소요기간 */}
          <div className="mt-8 p-6 bg-bg-cream rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-text-body">상담부터 오픈까지 총 소요기간</p>
              <p className="text-xs text-text-light mt-1">* 상권 및 시공 상황에 따라 달라질 수 있습니다</p>
            </div>
            <span className="text-xl text-brand-primary font-medium">약 8~12주</span>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/franchise/inquiry" className="btn-filled rounded-xl px-12 py-4">
              가맹 상담 신청하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
