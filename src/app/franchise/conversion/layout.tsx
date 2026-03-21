import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "업종변환 안내 - 기존 매장을 젤라또 매장으로",
  description: "기존 카페, 디저트 매장을 스쿱스 젤라떼리아로 업종변환하세요. 최소 비용으로 매장 리뉴얼, 본사 교육 지원, 빠른 오픈이 가능합니다. 상담 1811-0259.",
  keywords: "업종변환, 카페 업종변환, 디저트 매장 리뉴얼, 젤라또 매장 변환, 소자본 리뉴얼, 프랜차이즈 업종전환",
  alternates: { canonical: "https://scoopsgelato.kr/franchise/conversion" },
  openGraph: {
    title: "업종변환 안내 | 스쿱스 젤라떼리아",
    description: "기존 매장을 젤라또 매장으로 업종변환 안내",
    url: "https://scoopsgelato.kr/franchise/conversion",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스 젤라떼리아 업종변환 안내" }],
  },
};

export default function ConversionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
