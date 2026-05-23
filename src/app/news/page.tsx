"use client";

import { useState } from "react";
import Image from "next/image";
import SubNav from "@/components/SubNav";

interface NewsItem {
  id: number;
  date: string;
  category: string;
  title: string;
  desc: string;
  body: string;
}

const newsList: NewsItem[] = [
  {
    id: 1,
    date: "2026.03.10",
    category: "매장 소식",
    title: "스쿱스젤라또 관저점 신규 오픈 안내",
    desc: "대전 관저동에 스쿱스젤라또 관저점이 새롭게 오픈합니다. 오픈 기념 다양한 혜택을 준비했습니다.",
    body: "대전 관저동에 스쿱스젤라또 관저점이 새롭게 문을 엽니다. 정통 이탈리안 젤라또와 프리미엄 소르베또, 그리고 다양한 디저트를 만나보실 수 있습니다. 오픈 기념으로 방문하시는 모든 고객님께 특별한 혜택을 준비했습니다. 가까운 매장에서 스쿱스의 경험을 즐겨보세요.",
  },
  {
    id: 2,
    date: "2026.02.25",
    category: "신메뉴",
    title: "봄 시즌 한정 메뉴 출시",
    desc: "딸기 크림치즈 젤라또, 벚꽃 소르베또 등 봄의 향기를 담은 시즌 한정 메뉴를 만나보세요.",
    body: "따뜻한 봄을 맞아 스쿱스젤라또가 시즌 한정 메뉴를 선보입니다. 상큼한 딸기와 부드러운 크림치즈가 어우러진 딸기 크림치즈 젤라또, 봄의 정취를 담은 벚꽃 소르베또 등 이 계절에만 즐길 수 있는 특별한 맛을 준비했습니다. 한정 기간 동안만 판매되니 놓치지 마세요.",
  },
  {
    id: 3,
    date: "2026.02.14",
    category: "이벤트",
    title: "발렌타인데이 스페셜 패키지",
    desc: "사랑하는 사람과 함께 즐기는 발렌타인 젤라또 선물 세트를 한정 수량으로 판매합니다.",
    body: "사랑하는 사람에게 달콤한 마음을 전하세요. 발렌타인데이를 맞아 스쿱스젤라또가 특별한 젤라또 선물 세트를 한정 수량으로 준비했습니다. 정성스럽게 포장된 프리미엄 젤라또로 특별한 날을 더욱 달콤하게 만들어 보세요.",
  },
  {
    id: 4,
    date: "2026.01.30",
    category: "브랜드",
    title: "스쿱스젤라또 2026 리브랜딩 완료",
    desc: "새로운 브랜드 아이덴티티와 함께 더욱 세련된 모습으로 찾아뵙겠습니다.",
    body: "스쿱스젤라또가 2026년을 맞아 새로운 브랜드 아이덴티티로 거듭났습니다. 더욱 세련되고 따뜻한 감성을 담은 디자인으로, '경험을 파는 브랜드'라는 철학을 이어갑니다. 앞으로도 변함없는 품질과 새로운 경험으로 고객님을 찾아뵙겠습니다.",
  },
  {
    id: 5,
    date: "2026.01.15",
    category: "매장 소식",
    title: "지축점 리뉴얼 오픈",
    desc: "새로운 인테리어와 확장된 좌석으로 더욱 편안한 공간으로 재탄생했습니다.",
    body: "지축점이 새로운 인테리어와 확장된 좌석 공간으로 재탄생했습니다. 더욱 편안하고 아늑한 분위기에서 스쿱스의 젤라또를 즐기실 수 있습니다. 가족, 친구, 연인과 함께 여유로운 시간을 보내보세요.",
  },
  {
    id: 6,
    date: "2025.12.20",
    category: "이벤트",
    title: "연말 감사 이벤트 진행",
    desc: "한 해 동안 감사한 마음을 담아, 전 메뉴 20% 할인 이벤트를 진행합니다.",
    body: "한 해 동안 스쿱스젤라또를 사랑해 주신 고객님께 감사의 마음을 전합니다. 연말을 맞아 전 메뉴 20% 할인 이벤트를 진행합니다. 따뜻한 연말, 스쿱스의 달콤한 젤라또와 함께 행복한 시간 보내세요.",
  },
];

export default function NewsPage() {
  const [selected, setSelected] = useState<NewsItem | null>(null);

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
              <article
                key={item.id}
                onClick={() => setSelected(item)}
                className="group cursor-pointer text-left"
              >
                {/* 썸네일 */}
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-bg-cream mb-5 transition-transform group-hover:-translate-y-1">
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
        </div>
      </section>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 이미지 */}
            <div className="relative aspect-[16/9] bg-bg-cream flex items-center justify-center">
              <Image src="/images/logo_symbol.png" alt="" width={80} height={80} className="opacity-10" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors text-lg"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            {/* 본문 */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full">
                  {selected.category}
                </span>
                <span className="text-xs text-text-light">{selected.date}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-medium text-brand-primary mb-4 leading-snug">
                {selected.title}
              </h2>
              <p className="text-sm md:text-base text-text-body leading-relaxed whitespace-pre-line">
                {selected.body}
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-8 w-full btn-outline rounded-xl py-3 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
