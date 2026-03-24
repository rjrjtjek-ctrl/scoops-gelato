import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "브랜드 스토리 - 스쿱스의 이야기",
  description: "2018년 청주에서 시작된 스쿱스 젤라떼리아의 브랜드 스토리. 젤라또를 좋아하는 남매가 시작한 수제 젤라또 브랜드의 철학과 히스토리를 소개합니다.",
  keywords: "스쿱스젤라또, 스쿱스 젤라또, 스쿱스젤라떼리아, 젤라또 프랜차이즈, 수제 젤라또, 젤라또 창업, 스쿱스 브랜드 스토리, 젤라또 브랜드, 청주 젤라또",
  alternates: { canonical: "https://scoopsgelato.kr/story" },
  openGraph: {
    title: "브랜드 스토리 | 스쿱스젤라또",
    description: "2018년 청주에서 시작된 젤라또를 좋아하는 남매의 브랜드 이야기",
    url: "https://scoopsgelato.kr/story",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스 젤라떼리아 브랜드 스토리" }],
  },
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
