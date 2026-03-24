import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "업종변환 · 카페를 젤라또 매장으로 - 소자본 리뉴얼",
  description: "기존 카페, 디저트 매장을 스쿱스젤라또로 업종변환하세요. 최소 비용으로 매장 리뉴얼, 본사 교육 지원, 빠른 오픈. 카페 폐업 대신 업종변환으로 새 출발. 상담 1811-0259.",
  keywords: "스쿱스젤라또, 스쿱스 젤라또, 스쿱스젤라떼리아, 젤라또 프랜차이즈, 수제 젤라또, 젤라또 창업, 업종변환, 카페 업종변환, 소자본 리뉴얼, 카페 폐업, 매장 리뉴얼, 디저트 매장 변환, 프랜차이즈 업종전환, 카페 창업 실패, 업종 전환 비용, 소자본 창업",
  alternates: { canonical: "https://scoopsgelato.kr/franchise/conversion" },
  openGraph: {
    title: "스쿱스젤라또 | 카페 업종변환 - 소자본으로 젤라또 매장 시작",
    description: "카페 폐업 대신 업종변환. 최소 비용으로 젤라또 매장 리뉴얼. 상담 1811-0259.",
    url: "https://scoopsgelato.kr/franchise/conversion",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스젤라또 업종변환 - 카페를 젤라또 매장으로" }],
  },
};

export default function ConversionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
