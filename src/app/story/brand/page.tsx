import Image from "next/image";
import SubNav from "@/components/SubNav";

const timeline = [
  { year: "2019", title: "스쿱스젤라또 탄생", desc: "충북 청주에서 시작된 정통 이탈리안 젤라또 브랜드. 매일 신선한 원재료로 소량 생산하는 장인의 철학을 담았습니다." },
  { year: "2020", title: "첫 가맹점 오픈", desc: "브랜드의 가능성을 확인하고, 더 많은 고객에게 프리미엄 젤라또를 전하기 위해 가맹 사업을 시작했습니다." },
  { year: "2021", title: "전국 매장 확장", desc: "수도권과 충청권을 중심으로 매장을 확대하며, 젤라또 전문 브랜드로서 입지를 다져갔습니다." },
  { year: "2023", title: "시그니처 메뉴 리뉴얼", desc: "R&D 센터를 통해 계절별 시그니처 메뉴를 개발하고, 소르베또·디저트 라인업을 강화했습니다." },
  { year: "2024", title: "브랜드 리브랜딩", desc: "새로운 BI와 매장 인테리어 콘셉트를 도입하며, 프리미엄 젤라또 카페로 도약했습니다." },
];

const values = [
  { title: "신선함", sub: "Freshness", desc: "매일 아침 소량씩 직접 제조하는 당일 생산 원칙을 지킵니다." },
  { title: "정통", sub: "Authenticity", desc: "이탈리아 전통 레시피를 기반으로 한 정통 젤라또를 만듭니다." },
  { title: "건강", sub: "Wellness", desc: "합성 첨가물 없이 천연 재료만을 사용합니다." },
  { title: "즐거움", sub: "Joy", desc: "한 스쿱의 행복, 일상 속 작은 즐거움을 선사합니다." },
];

export default function BrandStoryPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="SCOOPS" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Brand Story</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">브랜드 스토리</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            한 스쿱에 담긴 진심, 스쿱스젤라또가 걸어온 길을 소개합니다.
          </p>
        </div>
      </section>

      {/* 브랜드 철학 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Our Philosophy</p>
              <h2 className="text-2xl md:text-3xl font-light text-brand-primary mb-6">
                매일 만드는<br />신선한 젤라또
              </h2>
              <p className="text-text-body leading-relaxed mb-4">
                스쿱스젤라또는 이탈리아 정통 방식 그대로, 매일 아침 신선한 우유와 제철 과일로
                소량씩 젤라또를 만듭니다. 대량 생산이 아닌 장인의 손끝에서 탄생하는
                프리미엄 젤라또, 그것이 스쿱스의 약속입니다.
              </p>
              <p className="text-text-body leading-relaxed">
                합성 착향료, 인공 색소를 사용하지 않는 클린 레시피로
                누구나 안심하고 즐길 수 있는 건강한 디저트를 지향합니다.
              </p>
            </div>
            <div className="relative aspect-square rounded-full overflow-hidden bg-bg-cream">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/images/logo_symbol.png" alt="스쿱스젤라또" width={120} height={120} className="opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="bg-bg-cream section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Core Values</p>
            <h2 className="text-2xl md:text-3xl font-light text-brand-primary">스쿱스의 핵심 가치</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-light text-brand-primary">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-lg font-medium text-brand-primary mb-1">{v.title}</h3>
                <p className="text-[11px] tracking-[0.15em] text-brand-secondary uppercase mb-3">{v.sub}</p>
                <p className="text-sm text-text-body leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 타임라인 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">History</p>
            <h2 className="text-2xl md:text-3xl font-light text-brand-primary">스쿱스의 발자취</h2>
          </div>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-brand-primary shrink-0 mt-2" />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-brand-primary/20" />}
                </div>
                <div className="pb-12">
                  <span className="text-[12px] tracking-[0.15em] text-brand-secondary font-medium">{item.year}</span>
                  <h3 className="text-lg text-brand-primary font-medium mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-text-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
