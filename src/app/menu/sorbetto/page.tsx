import Image from "next/image";
import SubNav from "@/components/SubNav";

const sorbet = [
  { name: "망고 소르베또", desc: "인도산 알폰소 망고를 듬뿍 사용한 트로피컬 소르베또", price: "4,500원", badge: "인기" },
  { name: "패션후르츠 소르베또", desc: "새콤달콤한 패션후르츠의 상큼함을 그대로 담았습니다", price: "4,500원", badge: null },
  { name: "레몬 소르베또", desc: "시칠리아 레몬즙과 껍질을 사용한 클래식 이탈리안 소르베또", price: "4,500원", badge: "시그니처" },
  { name: "라즈베리 소르베또", desc: "진한 라즈베리의 풍미와 자연스러운 단맛의 조화", price: "4,500원", badge: null },
  { name: "리치 소르베또", desc: "향긋한 리치를 통째로 갈아 만든 부드러운 소르베또", price: "4,500원", badge: null },
  { name: "유자 소르베또", desc: "고흥 유자청을 블렌딩한 한국적 소르베또", price: "4,800원", badge: "신메뉴" },
];

export default function SorbettoPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="MENU" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Sorbetto</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">소르베또</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            과일 본연의 맛을 살린 청량한 이탈리안 소르베또.
            젤라또보다 가볍고 상큼한 여운을 즐기실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 메뉴 그리드 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorbet.map((item, i) => (
              <div key={i} className="group">
                {/* 이미지 플레이스홀더 */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-cream mb-5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image src="/images/logo_symbol.png" alt="" width={60} height={60} className="opacity-10" />
                  </div>
                  {item.badge && (
                    <span className="absolute top-4 left-4 bg-brand-primary text-white text-[11px] px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-brand-primary mb-1">{item.name}</h3>
                <p className="text-sm text-text-body leading-relaxed mb-2">{item.desc}</p>
                <p className="text-sm text-brand-secondary font-medium">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 소르베또 특징 */}
      <section className="bg-bg-cream section-padding">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Why Sorbetto?</p>
          <h2 className="text-2xl md:text-3xl font-light text-brand-primary mb-8">소르베또가 특별한 이유</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "제철 과일 중심", desc: "신선한 제철 과일을 아낌없이 사용해 과일 본연의 맛과 향을 담았습니다." },
              { title: "청량한 여운", desc: "젤라또보다 유지방이 적어 상큼하고 깔끔한 뒷맛이 특징입니다." },
              { title: "가벼운 디저트", desc: "젤라또 대비 칼로리가 낮아 식후에도 부담 없이 즐기기 좋습니다." },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-bg-white rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-light text-brand-primary">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-base font-medium text-brand-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* 알레르기 안내 */}
          <div className="mt-12 max-w-[700px] mx-auto text-left bg-bg-white border border-brand-primary/15 rounded-2xl p-6 md:p-8">
            <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-3">Allergen Notice</p>
            <h3 className="text-base md:text-lg font-medium text-brand-primary mb-3">알레르기 안내</h3>
            <p className="text-sm text-text-body leading-relaxed">
              스쿱스 소르베또는 젤라또와 <strong className="text-brand-primary">동일한 설비에서 제조</strong>되며,
              레시피에 <strong className="text-brand-primary">소량의 유제품(분유)</strong>이 포함되어 있습니다.
              <br className="hidden md:block" />
              유제품·달걀 등에 알레르기가 있으신 고객님께는 권해드리지 않으며,
              드시기 전 매장 직원에게 문의해 주세요.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
