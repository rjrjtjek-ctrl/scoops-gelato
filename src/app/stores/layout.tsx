import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "매장 안내 - 전국 매장 찾기",
  description: "스쿱스 젤라떼리아 전국 17개 매장 위치 안내. 청주, 서울 여의도·공덕, 대전, 진주, 수원, 전주, 고양 지축, 천안 등 가까운 매장을 찾아보세요.",
  openGraph: {
    title: "매장 안내 | 스쿱스 젤라떼리아",
    description: "전국 17개 매장 위치 및 영업시간 안내",
  },
};

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
