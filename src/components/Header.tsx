"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface SubLink {
  href: string;
  label: string;
  external?: boolean;
}

const navLinks: { label: string; href: string; sub: SubLink[] }[] = [
  {
    label: "SCOOPS",
    href: "/story",
    sub: [
      { href: "/story", label: "스쿱스젤라또 소개" },
      { href: "/story#history", label: "브랜드 스토리" },
      { href: "/stores", label: "찾아오시는길" },
    ],
  },
  {
    label: "MENU",
    href: "/menu",
    sub: [
      { href: "/menu#gelato", label: "시그니처 젤라또" },
      { href: "/menu#sorbetto", label: "소르베또" },
      { href: "/menu#coffee", label: "커피" },
      { href: "/menu#dessert", label: "디저트" },
      { href: "/menu#whiskey", label: "위스키" },
      { href: "/menu#wine", label: "와인" },
    ],
  },
  {
    label: "FRANCHISE",
    href: "/franchise",
    sub: [
      { href: "/franchise#benefits", label: "스쿱스 경쟁력" },
      { href: "/franchise#inquiry", label: "가맹점 상담신청" },
      { href: "/franchise#process", label: "가맹점 개설절차" },
      { href: "/franchise#costs", label: "가맹점 개설비용" },
      { href: "/franchise#faq", label: "가맹문의 Q&A" },
      { href: "/franchise/conversion", label: "업종변경 안내" },
      { href: "https://www.xn--ok0bz3ittr.kr/", label: "AI 상권분석", external: true },
    ],
  },
  {
    label: "STORE",
    href: "/stores",
    sub: [
      { href: "/stores", label: "매장 찾기" },
    ],
  },
  {
    label: "NEWS",
    href: "/story#news",
    sub: [
      { href: "/story#news", label: "스쿱스 소식" },
      { href: "/story#events", label: "이벤트" },
    ],
  },
  {
    label: "CUSTOMER",
    href: "/franchise#voice",
    sub: [
      { href: "/franchise#voice", label: "고객의 소리" },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-bg-cream shadow-sm"
        onMouseLeave={() => setMegaOpen(false)}
      >
        {/* 메인 네비게이션 */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-[80px] flex items-center">
          {/* 로고 — 심볼만 표시 (고정 너비) */}
          <Link href="/" className="flex-shrink-0 mr-8 lg:mr-12 flex items-center gap-3">
            <div className="w-[40px] h-[30px] relative">
              <Image
                src="/images/logo_symbol.png"
                alt="SCOOPS GELATERIA"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* 데스크탑 네비게이션 — 6등분 그리드 (드롭다운과 동일 구조) */}
          <nav className="hidden md:grid grid-cols-6 flex-1 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] tracking-[0.08em] font-semibold text-brand-primary hover:text-brand-accent transition-colors duration-200 flex items-center"
                onMouseEnter={() => setMegaOpen(true)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden ml-auto text-brand-primary z-[1000]"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 데스크탑 메가 드롭다운 — 텐퍼센트커피 스타일 */}
        <div
          className={`hidden md:block border-t border-black/5 bg-bg-white transition-all duration-300 overflow-hidden ${
            megaOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8">
            <div className="flex">
              {/* 로고 영역만큼 왼쪽 여백 — 상단 nav 로고와 동일한 공간 확보 */}
              <div className="flex-shrink-0 mr-8 lg:mr-12 w-[40px]" />
              {/* 6등분 그리드 — 상단 nav과 동일 구조 */}
              <div className="grid grid-cols-6 flex-1 gap-6">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <ul className="space-y-3">
                      {link.sub.map((sub, i) => (
                        <li key={i}>
                          {sub.external ? (
                            <a
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[14px] text-brand-secondary hover:text-brand-primary transition-colors font-medium"
                            >
                              {sub.label} ↗
                            </a>
                          ) : (
                            <Link
                              href={sub.href}
                              className="text-[14px] text-text-body hover:text-brand-primary transition-colors"
                            >
                              {sub.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-bg-cream overflow-y-auto">
          <div className="flex items-center justify-between px-6 h-[80px]">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <div className="w-[40px] h-[30px] relative">
                <Image
                  src="/images/logo_symbol.png"
                  alt="SCOOPS GELATERIA"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6 text-brand-primary" />
            </button>
          </div>
          <nav className="px-8 py-6 space-y-8">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg tracking-[0.12em] text-brand-primary font-semibold"
                >
                  {link.label}
                </Link>
                <ul className="mt-3 space-y-2 pl-1">
                  {link.sub.map((sub, i) => (
                    <li key={i}>
                      {sub.external ? (
                        <a
                          href={sub.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-brand-secondary font-medium"
                        >
                          {sub.label} ↗
                        </a>
                      ) : (
                        <Link
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-text-body"
                        >
                          {sub.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
