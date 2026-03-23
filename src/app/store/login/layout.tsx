import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "스쿱스점주",
  description: "스쿱스젤라또 점주 관리 시스템",
  openGraph: {
    title: "스쿱스점주",
    description: "스쿱스젤라또 점주 관리 시스템",
    siteName: "SCOOPS GELATERIA",
  },
};

export default function StoreLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
