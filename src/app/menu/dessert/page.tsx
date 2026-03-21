import Image from "next/image";
import SubNav from "@/components/SubNav";

const desserts = [
  { name: "젤라또 와플", desc: "바삭한 벨기에 와플 위에 2가지 젤라또를 올린 시그니처 디저트", price: "7,500원", badge: "시그니처" },
  { name: "젤라또 크레페", desc: "부드러운 프렌치 크레페에 젤라또와 생크림, 과일을 곁들였습니다", price: "7,000원", badge: null },
  { name: "젤라또 마카롱", desc: "쫀득한 수제 마카롱 사이에 젤라또를 채운 프리미엄 마카롱 아이스", price: "4,500원", badge: "인기" },
  { name: "브라우니 선데이", desc: "따뜻한 초콜릿 브라우니에 바닐라 젤라또와 핫 퍼지를 곁들인 선데이", price: "8,000원", badge: null },
  { name: "판나코타", desc: "이탈리안 전통 디저트 판나코타에 계절 과일 콤포트를 올렸습니다", price: "5,500원", badge: null },
  { name: "티라미수", desc: "마스카포네 크림과 에스프레소가 어우러진 클래식 이탈리안 티라미수", price: "6,000원", badge: "NEW" },
];

export default function DessertPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="MENU" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Dessert</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">디저트</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            젤라또와 함께 즐기는 프리미엄 디저트 라인업.
            와플, 크레페부터 이탈리안 클래식까지 다양하게 준비했습니다.
          </p>
        </div>
      </section>

      {/* 디저트 메뉴 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {desserts.map((item, i) => (
              <div key={i} className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg-cream mb-5">
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

      {/* 패키지 안내 */}
      <section className="bg-bg-cream section-padding">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Special Package</p>
          <h2 className="text-2xl md:text-3xl font-light text-brand-primary mb-6">디저트 세트 패키지</h2>
          <p className="text-text-body leading-relaxed mb-8">
            젤라또 2스쿱 + 디저트 1종 + 음료 1잔을 합리적인 가격으로 즐기세요.
            매장에서 직원에게 문의해 주세요.
          </p>
          <div className="inline-flex items-center gap-4 bg-bg-white rounded-2xl px-8 py-5">
            <span className="text-sm text-text-body">디저트 세트</span>
            <span className="w-px h-6 bg-brand-primary/20" />
            <span className="text-lg text-brand-primary font-medium">12,000원~</span>
          </div>
        </div>
      </section>
    </main>
  );
}
