import Image from "next/image";
import Link from "next/link";
import SubNav from "@/components/SubNav";

const newsList = [
  {
    id: 1,
    date: "2026.03.10",
    category: "매장 소식",
    title: "스쿱스젤라또 관저점 신규 오픈 안내",
    desc: "대전 관저동에 스쿱스젤라또 관저점이 새롭게 오픈합니다. 오픈 기념 다양한 혜택을 준비했습니다.",
  },
  {
    id: 2,
    date: "2026.02.25",
    category: "신메뉴",
    title: "봄 시즌 한정 메뉴 출시",
    desc: "딸기 크림치즈 젤라또, 벚꽃 소르베또 등 봄의 향기를 담은 시즌 한정 메뉴를 만나보세요.",
  },
  {
    id: 3,
    date: "2026.02.14",
    category: "이벤트",
    title: "발렌타인데이 스페셜 패키지",
    desc: "사랑하는 사람과 함께 즐기는 발렌타인 젤라또 선물 세트를 한정 수량으로 판매합니다.",
  },
  {
    id: 4,
    date: "2026.01.30",
    category: "브랜드",
    title: "스쿱스젤라또 2026 리브랜딩 완료",
    desc: "새로운 브랜드 아이덴티티와 함께 더욱 세련된 모습으로 찾아뵙겠습니다.",
  },
  {
    id: 5,
    date: "2026.01.15",
    category: "매장 소식",
    title: "지축점 리뉴얼 오픈",
    desc: "새로운 인테리어와 확장된 좌석으로 더욱 편안한 공간으로 재탄생했습니다.",
  },
  {
    id: 6,
    date: "2025.12.20",
    category: "이벤트",
    title: "연말 감사 이벤트 진행",
    desc: "한 해 동안 감사한 마음을 담아, 전 메뉴 20% 할인 이벤트를 진행합니다.",
  },
];

export default function NewsPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="NEWS" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">News</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">스쿱스 소식</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            스쿱스젤라또의 새로운 소식과 이야기를 전합니다.
          </p>
        </div>
      </section>

      {/* 뉴스 리스트 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item) => (
              <article key={item.id} className="group cursor-pointer">
                {/* 썸네일 */}
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-bg-cream mb-5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image src="/images/logo_symbol.png" alt="" width={60} height={60} className="opacity-10" />
                  </div>
                </div>
                {/* 카테고리 & 날짜 */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-text-light">{item.date}</span>
                </div>
                {/* 제목 */}
                <h3 className="text-base font-medium text-brand-primary mb-2 group-hover:text-brand-accent transition-colors">
                  {item.title}
                </h3>
                {/* 설명 */}
                <p className="text-sm text-text-body leading-relaxed line-clamp-2">{item.desc}</p>
              </article>
            ))}
          </div>

          {/* 더보기 */}
          <div className="mt-16 text-center">
            <button className="btn-outline rounded-xl px-10 py-3">더 보기</button>
          </div>
        </div>
      </section>
    </main>
  );
}
