import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "매장 안내 - 전국 매장 찾기",
  description: "스쿱스 젤라떼리아 전국 매장 위치 안내. 청주 본점, 서울 여의도·공덕, 고양 지축, 대전 관저·선화 등 가까운 매장을 찾아보세요.",
  keywords: "스쿱스 매장, 젤라또 매장 찾기, 청주 젤라또, 여의도 젤라또, 공덕 젤라또, 지축 젤라또, 관저 젤라또, 선화 젤라또",
  alternates: { canonical: "https://scoopsgelato.kr/stores" },
  openGraph: {
    title: "매장 안내 | 스쿱스 젤라떼리아",
    description: "전국 매장 위치 및 영업시간 안내",
    url: "https://scoopsgelato.kr/stores",
    images: [{ url: "/images/gelato-plating-hero.jpg", width: 1200, height: 630, alt: "스쿱스 젤라떼리아 매장 안내" }],
  },
};

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
