import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-warm">
      {/* 상단 — 로고 + 정보 */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* 로고 + 소개 */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <div className="w-[44px] h-[34px] relative">
                <Image
                  src="/images/logo_symbol.png"
                  alt="SCOOPS GELATERIA"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-text-body text-sm leading-relaxed mb-4">
              이탈리아 정통 레시피와
              <br />
              엄선된 원재료로 만드는
              <br />
              수제 젤라또.
            </p>
            <a
              href="https://www.instagram.com/_scoopsgelato_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors text-sm"
            >
              <Instagram className="w-4 h-4" />
              <span className="tracking-wider">@_scoopsgelato_</span>
            </a>
          </div>

          {/* 네비게이션 */}
          <div>
            <p className="text-[12px] tracking-[0.1em] text-brand-primary font-semibold mb-4 uppercase">
              Menu
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/story", label: "브랜드 스토리" },
                { href: "/menu", label: "시그니처 젤라또" },
                { href: "/stores", label: "매장 안내" },
                { href: "/franchise", label: "가맹 문의" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-body hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 운영 시간 */}
          <div>
            <p className="text-[12px] tracking-[0.1em] text-brand-primary font-semibold mb-4 uppercase">
              Hours
            </p>
            <ul className="space-y-2.5 text-sm text-text-body">
              <li>본점 10:00 — 22:00</li>
              <li>본사 09:00 — 18:00</li>
              <li className="text-text-light text-xs pt-1">
                * 매장별 영업시간 상이
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <p className="text-[12px] tracking-[0.1em] text-brand-primary font-semibold mb-4 uppercase">
              Contact
            </p>
            <ul className="space-y-2.5 text-sm text-text-body">
              <li>상호 : 스쿱스 젤라떼리아</li>
              <li>대표 : 정석주</li>
              <li>대표번호 : 1811-0259</li>
              <li>충북 청주시 서원구 1순환로 672번길 35, 1층</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 카피라이트 */}
      <div className="border-t border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-text-light">
          <p>
            &copy; {new Date().getFullYear()} Scoops Gelateria. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-brand-primary transition-colors">개인정보처리방침</Link>
            <span>|</span>
            <p>가맹 상담 1811-0259</p>
            <span>|</span>
            <Link href="/admin" className="hover:text-brand-primary transition-colors">관리자</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
