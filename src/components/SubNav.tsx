"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
  href: string;
  label: string;
}

interface SubNavProps {
  category: string;
  items: SubNavItem[];
}

const navMap: Record<string, SubNavItem[]> = {
  SCOOPS: [
    { href: "/story", label: "스쿱스젤라또 소개" },
    { href: "/story/brand", label: "브랜드 스토리" },
    { href: "/story/location", label: "찾아오시는길" },
  ],
  MENU: [
    { href: "/menu", label: "시그니처 젤라또" },
    { href: "/menu/sorbetto", label: "소르베또" },
    { href: "/menu/coffee", label: "커피" },
    { href: "/menu/dessert", label: "디저트" },
  ],
  FRANCHISE: [
    { href: "/franchise", label: "스쿱스 경쟁력" },
    { href: "/franchise/inquiry", label: "가맹점 상담신청" },
    { href: "/franchise/process", label: "가맹점 개설절차" },
    { href: "/franchise/cost", label: "가맹점 개설비용" },
    { href: "/franchise/faq", label: "가맹문의 Q&A" },
  ],
  NEWS: [
    { href: "/news", label: "스쿱스 소식" },
    { href: "/news/events", label: "이벤트" },
  ],
  CUSTOMER: [
    { href: "/customer", label: "고객의 소리" },
  ],
};

export default function SubNav({ category }: { category: string }) {
  const pathname = usePathname();
  const items = navMap[category] || [];

  if (items.length <= 1) return null;

  return (
    <div className="bg-bg-white border-b border-black/5 sticky top-[80px] z-40">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          <span className="text-[11px] tracking-[0.15em] text-brand-secondary font-medium uppercase shrink-0 mr-4 hidden md:block">
            {category}
          </span>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 text-[13px] px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-brand-primary font-medium bg-brand-primary/5"
                    : "text-text-body hover:text-brand-primary hover:bg-brand-primary/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
