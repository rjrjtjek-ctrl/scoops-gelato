import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "스쿱스직원",
  description: "스쿱스젤라또 직원 업무 시스템",
  openGraph: {
    title: "스쿱스직원",
    description: "스쿱스젤라또 직원 업무 시스템",
    siteName: "SCOOPS GELATERIA",
  },
};

export default function StaffLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
