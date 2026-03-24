import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "메뉴 안내 - 시그니처 젤라또 & 소르베또",
  description: "스쿱스 젤라떼리아의 시그니처 메뉴를 소개합니다. 갓지은쌀, 벨기에 다크 카카오, 밀라노 티라미수 등 20여 가지 수제 젤라또와 소르베또, 커피, 디저트 메뉴.",
  keywords: "스쿱스젤라또, 스쿱스 젤라또, 스쿱스젤라떼리아, 젤라또 프랜차이즈, 수제 젤라또, 젤라또 창업, 젤라또 메뉴, 소르베또, 갓지은쌀 젤라또",
  alternates: { canonical: "https://scoopsgelato.kr/menu" },
  openGraph: {
    title: "메뉴 안내 | 스쿱스젤라또",
    description: "갓지은쌀, 벨기에 다크 카카오 등 20여 가지 수제 젤라또 메뉴",
    url: "https://scoopsgelato.kr/menu",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스 젤라떼리아 시그니처 젤라또 메뉴" }],
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
