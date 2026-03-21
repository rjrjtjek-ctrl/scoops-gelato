import Image from "next/image";
import SubNav from "@/components/SubNav";

const coffeeMenu = [
  { name: "에스프레소", desc: "진한 크레마와 깊은 바디감의 싱글 오리진 에스프레소", price: "3,500원", badge: null },
  { name: "아메리카노", desc: "깔끔하고 균형 잡힌 매일의 커피", price: "4,000원", badge: null },
  { name: "카페라떼", desc: "부드러운 우유와 에스프레소의 클래식 조합", price: "4,500원", badge: null },
  { name: "아포가토", desc: "뜨거운 에스프레소를 젤라또 위에 부어 즐기는 이탈리안 디저트 커피", price: "5,500원", badge: "시그니처" },
  { name: "콜드브루", desc: "12시간 저온 추출로 깔끔하고 부드러운 맛의 콜드브루", price: "4,500원", badge: "인기" },
  { name: "바닐라 라떼", desc: "마다가스카르 바닐라빈으로 향을 낸 프리미엄 라떼", price: "5,000원", badge: null },
  { name: "카라멜 마키아또", desc: "카라멜 시럽과 에스프레소, 우유의 달콤한 하모니", price: "5,000원", badge: null },
  { name: "녹차 라떼", desc: "국내산 말차를 사용한 진한 녹차 라떼", price: "5,000원", badge: null },
];

export default function CoffeePage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="MENU" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Coffee &amp; Beverage</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">커피</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            스페셜티 원두로 내린 커피와 젤라또가 만나는 특별한 조합.
            아포가토부터 클래식 에스프레소까지 다양하게 준비했습니다.
          </p>
        </div>
      </section>

      {/* 메뉴 리스트 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coffeeMenu.map((item, i) => (
              <div key={i} className="group">
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
                <h3 className="text-base font-medium text-brand-primary mb-1">{item.name}</h3>
                <p className="text-sm text-text-body leading-relaxed mb-2">{item.desc}</p>
                <p className="text-sm text-brand-secondary font-medium">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 원두 소개 */}
      <section className="bg-bg-cream section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Our Beans</p>
              <h2 className="text-2xl md:text-3xl font-light text-brand-primary mb-6">스페셜티 원두</h2>
              <p className="text-text-body leading-relaxed mb-4">
                스쿱스젤라또는 젤라또뿐 아니라 커피에도 진심입니다.
                싱글 오리진 스페셜티 원두를 엄선하여, 매장에서 직접 로스팅합니다.
              </p>
              <p className="text-text-body leading-relaxed">
                특히 아포가토는 젤라또와 에스프레소의 완벽한 조합으로,
                스쿱스만의 시그니처 메뉴입니다.
              </p>
            </div>
            <div className="aspect-square rounded-2xl bg-bg-warm flex items-center justify-center">
              <Image src="/images/logo_symbol.png" alt="" width={100} height={100} className="opacity-15" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
