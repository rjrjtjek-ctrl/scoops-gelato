"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight } from "lucide-react";
import { stores } from "@/lib/order-data";

export default function OrderStorePage() {
  const activeStores = stores.filter((s) => s.isActive && s.code !== "demo");

  return (
    <div className="min-h-dvh bg-[#FDFBF8] flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-[480px] px-5 pt-10 pb-6 text-center">
        <Image
          src="/images/logo_symbol.png"
          alt="SCOOPS GELATERIA"
          width={48}
          height={48}
          className="mx-auto mb-4"
        />
        <h1 className="text-lg font-bold text-[#2A2A2A]">
          SCOOPS GELATERIA
        </h1>
      </header>

      {/* Store Selection */}
      <main className="w-full max-w-[480px] px-5 pb-10 flex-1">
        <p className="text-center text-[#555] text-sm mb-6">
          주문할 매장을 선택해주세요
        </p>

        <div className="space-y-3">
          {activeStores.map((store) => (
            <Link
              key={store.code}
              href={`/order/${store.code}`}
              className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#EDE6DD]/60 hover:border-[#1B4332]/30 transition-colors active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#1B4332]/5 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#1B4332]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#2A2A2A] text-[15px]">
                    {store.name}
                  </p>
                  {store.address && (
                    <p className="text-xs text-[#999] truncate">
                      {store.address}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-[#BBB] flex-shrink-0" />
            </Link>
          ))}
        </div>

        {activeStores.length === 0 && (
          <div className="text-center py-20 text-[#999]">
            <p>현재 운영 중인 매장이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
