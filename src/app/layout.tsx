import type { Metadata } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const ibmPlexSansKR = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://scoopsgelato.kr";
const SITE_NAME = "스쿱스 젤라떼리아";
const DEFAULT_DESC = "이탈리아 정통 프리미엄 젤라또 프랜차이즈. 전국 17개 매장에서 매일 매장에서 직접 만드는 신선한 수제 젤라또를 만나보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SCOOPS GELATERIA | 스쿱스 젤라떼리아 - 경험을 파는 브랜드",
    template: "%s | 스쿱스 젤라떼리아",
  },
  description: DEFAULT_DESC,
  keywords: "젤라또, 젤라토, 아이스크림, 프랜차이즈, 디저트, 스쿱스, 젤라떼리아, 수제젤라또, 가맹점, gelato, scoops",
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, email: true },
  alternates: {
    canonical: SITE_URL,
    languages: { "ko-KR": SITE_URL },
  },
  other: {
    "Content-Language": "ko",
    "geo.region": "KR-43",
    "geo.placename": "청주시",
    "geo.position": "36.6358;127.4595",
    "ICBM": "36.6358, 127.4595",
  },
  openGraph: {
    title: "SCOOPS GELATERIA | 스쿱스 젤라떼리아",
    description: DEFAULT_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/images/gelato-plating-hero.jpg",
        width: 1200,
        height: 630,
        alt: "스쿱스 젤라떼리아 수제 젤라또",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SCOOPS GELATERIA | 스쿱스 젤라떼리아",
    description: DEFAULT_DESC,
    images: ["/images/gelato-plating-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "nJI8c4LF-Xx_ZECTekzVUWGS0UUrd1RD61rCHUdeK_E",
    other: { "naver-site-verification": "9995aedc77fbba4d71d5aed723fdfacad57ce4e4" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#1B4332" />
        <meta name="format-detection" content="telephone=yes" />
        <JsonLd />
      </head>
      <body
        className={`${ibmPlexSansKR.variable} font-sans antialiased`}
      >
        <Analytics />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
