import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/lib/cart-context";
import { PwaRegistrar } from "@/components/PwaRegistrar";

export const metadata: Metadata = {
  title: "스쿱스젤라또",
  description: "스쿱스 젤라떼리아 QR 모바일 주문",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "스쿱스젤라또",
  },
  other: {
    "apple-mobile-web-app-title": "스쿱스젤라또",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <head>
        <link rel="apple-touch-icon" href="/images/logo_favicon_192.png" />
      </head>
      <div className="order-root min-h-dvh bg-[#FDFBF8]">
        <PwaRegistrar />
        {children}
      </div>
    </CartProvider>
  );
}
