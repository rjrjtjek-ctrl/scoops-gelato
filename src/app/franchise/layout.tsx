import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가맹 문의 - 프랜차이즈 창업 안내",
  description: "스쿱스 젤라떼리아 가맹점 창업 안내. 체계적인 교육과 본사 지원, 검증된 수제 젤라또 프랜차이즈 사업으로 성공적인 창업을 함께합니다. 가맹 상담 1811-0259.",
  keywords: "젤라또 프랜차이즈, 젤라또 창업, 아이스크림 가맹점, 디저트 창업, 스쿱스 가맹, 소자본 창업, 프랜차이즈 상담",
  alternates: { canonical: "https://scoopsgelato.kr/franchise" },
  openGraph: {
    title: "가맹 문의 | 스쿱스 젤라떼리아",
    description: "젤라또 프랜차이즈 창업 상담 및 가맹 안내 | 1811-0259",
    url: "https://scoopsgelato.kr/franchise",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스 젤라떼리아 프랜차이즈 창업 안내" }],
  },
};

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
