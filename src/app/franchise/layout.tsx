import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "젤라또 창업 · 가맹 문의 - 가맹비 0원 프랜차이즈",
  description: "스쿱스젤라또 가맹점 창업 안내. 가맹비 0원, 교육비 100만원. 1인 운영 가능한 소자본 디저트 창업. 젤라또+위스키바 복합 매장으로 높은 수익성. 체계적인 본사 교육과 지원. 가맹 상담 1811-0259.",
  keywords: "스쿱스젤라또, 스쿱스 젤라또, 스쿱스젤라떼리아, 젤라또 프랜차이즈, 수제 젤라또, 젤라또 창업, 가맹비 0원, 소자본 창업, 프랜차이즈 상담, 디저트 창업, 아이스크림 창업, 젤라또 가맹, 프랜차이즈 창업, 소자본 프랜차이즈, 1인 창업, 무인 창업, 디저트 프랜차이즈, 아이스크림 프랜차이즈, 카페 창업, 디저트 가맹, 젤라또 매장, 위스키바 창업, 디저트바 창업, 프리미엄 디저트, 창업 비용, 창업 문의, 프랜차이즈 비용, 가맹점 모집, 젤라또 브랜드",
  alternates: { canonical: "https://scoopsgelato.kr/franchise" },
  openGraph: {
    title: "스쿱스젤라또 | 가맹비 0원 젤라또 프랜차이즈 창업",
    description: "가맹비 0원, 교육비 100만원. 1인 운영 소자본 디저트 창업. 전국 17개 매장 운영 중. 가맹 상담 1811-0259.",
    url: "https://scoopsgelato.kr/franchise",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스젤라또 프랜차이즈 창업 - 가맹비 0원" }],
  },
};

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
