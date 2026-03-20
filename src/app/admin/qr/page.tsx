"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Download, QrCode } from "lucide-react";
import { stores } from "@/lib/order-data";

// QR 코드를 canvas에 직접 그리기 (외부 라이브러리 없이)
// 실제 프로덕션에서는 qrcode.react 사용
function SimpleQRPlaceholder({ url, storeName }: { url: string; storeName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;

    // 배경
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size + 60);

    // QR 패턴 시뮬레이션 (실제로는 qrcode 라이브러리 사용)
    ctx.fillStyle = "#1B4332";
    const moduleSize = 8;
    const margin = 40;

    // 모서리 파인더 패턴
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = "#1B4332";
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };

    drawFinder(margin, margin);
    drawFinder(size - margin - moduleSize * 7, margin);
    drawFinder(margin, size - margin - moduleSize * 7);

    // 랜덤 모듈 (시뮬레이션)
    const seed = url.length;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i * 31 + j * 17 + seed) % 3 === 0) {
          const px = margin + moduleSize * 3 + i * (moduleSize + 2);
          const py = margin + moduleSize * 3 + j * (moduleSize + 2);
          if (px < size - margin && py < size - margin) {
            ctx.fillRect(px, py, moduleSize, moduleSize);
          }
        }
      }
    }

    // 중앙 로고 영역
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(size / 2 - 30, size / 2 - 30, 60, 60);
    ctx.fillStyle = "#1B4332";
    ctx.font = "bold 14px IBM Plex Sans KR, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCOOPS", size / 2, size / 2 + 5);

    // 하단 매장명
    ctx.fillStyle = "#2A2A2A";
    ctx.font = "bold 16px IBM Plex Sans KR, sans-serif";
    ctx.fillText(storeName, size / 2, size + 25);
    ctx.fillStyle = "#999999";
    ctx.font = "12px IBM Plex Sans KR, sans-serif";
    ctx.fillText(url, size / 2, size + 48);
  }, [url, storeName]);

  return <canvas ref={canvasRef} className="w-full max-w-[300px] mx-auto" />;
}

export default function AdminQRPage() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const activeStores = stores.filter((s) => s.isActive);

  const handleDownload = (storeCode: string, storeName: string) => {
    // 실제 구현에서는 qrcode 라이브러리로 진짜 QR 생성 후 다운로드
    const canvas = document.querySelector(`#qr-${storeCode} canvas`) as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `QR_${storeName}_scoopsgelato.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">QR 코드 관리</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">
          각 매장의 QR 코드를 다운로드하여 매장에 비치하세요. 고객이 QR을 스캔하면 해당 매장의 주문 페이지로 이동합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeStores.map((store) => (
            <div
              key={store.code}
              id={`qr-${store.code}`}
              className="bg-white rounded-xl border border-gray-200 p-6 text-center"
            >
              <h3 className="font-bold text-gray-900 mb-4">{store.name}</h3>

              <SimpleQRPlaceholder
                url={`scoopsgelato.kr/order/${store.code}`}
                storeName={store.name}
              />

              <p className="text-xs text-gray-400 mt-3 mb-4">
                scoopsgelato.kr/order/{store.code}
              </p>

              <button
                onClick={() => handleDownload(store.code, store.name)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
              >
                <Download size={14} /> PNG 다운로드
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>참고:</strong> 현재 QR 코드는 시각적 미리보기입니다. 실제 운영 시에는 qrcode.react 패키지를 설치하면 스캔 가능한 진짜 QR 코드가 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
