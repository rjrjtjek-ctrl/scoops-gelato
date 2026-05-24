"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, TrendingUp, ShoppingBag, Receipt, Download } from "lucide-react";
import { stores } from "@/lib/order-data";
import type { Order } from "@/lib/order-types";

type Period = "today" | "yesterday" | "7days" | "30days";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "yesterday", label: "어제" },
  { key: "7days", label: "최근 7일" },
  { key: "30days", label: "최근 30일" },
];

// KST 기준 날짜 문자열 (YYYY-MM-DD)
function kstDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rangeFor(period: Period): { from: string; to: string } {
  switch (period) {
    case "today": return { from: kstDateStr(0), to: kstDateStr(0) };
    case "yesterday": return { from: kstDateStr(-1), to: kstDateStr(-1) };
    case "7days": return { from: kstDateStr(-6), to: kstDateStr(0) };
    case "30days": return { from: kstDateStr(-29), to: kstDateStr(0) };
  }
}

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

export default function SalesPage() {
  const [selectedStore, setSelectedStore] = useState(
    stores.find((s) => s.isActive && s.id !== "demo")?.id || stores.find((s) => s.isActive)?.id || ""
  );
  const [period, setPeriod] = useState<Period>("today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const activeStores = stores.filter((s) => s.isActive && s.id !== "demo");

  const fetchData = useCallback(() => {
    if (!selectedStore) return;
    setLoading(true);
    const { from, to } = rangeFor(period);
    fetch(`/api/order?storeId=${selectedStore}&from=${from}&to=${to}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => { setOrders([]); setLoading(false); });
  }, [selectedStore, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 집계 ──
  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = valid.reduce((s, o) => s + o.totalAmount, 0);
    const orderCount = valid.length;
    const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    let dineIn = 0, takeaway = 0, dineInRev = 0, takeawayRev = 0;
    let gelatoRev = 0, drinkRev = 0;
    const menuMap: Record<string, { qty: number; revenue: number }> = {};   // 메뉴(가지수/주류명)별
    const flavorMap: Record<string, number> = {};                            // 젤라또 맛별 수량
    const drinkMap: Record<string, { qty: number; revenue: number }> = {};   // 주류별
    const hourly = new Array(24).fill(0);                                     // 시간대별 매출
    const dailyMap: Record<string, number> = {};                             // 일별 매출

    for (const o of valid) {
      if (o.orderType === "dine_in") { dineIn++; dineInRev += o.totalAmount; }
      else { takeaway++; takeawayRev += o.totalAmount; }

      // 시간대 (KST = UTC+9)
      const h = new Date(new Date(o.createdAt).getTime() + 9 * 3600 * 1000).getUTCHours();
      hourly[h] += o.totalAmount;

      // 일별 (KST)
      const dk = new Date(new Date(o.createdAt).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      dailyMap[dk] = (dailyMap[dk] || 0) + o.totalAmount;

      for (const it of o.items || []) {
        const isGelato = Array.isArray(it.selectedFlavors) && it.selectedFlavors.length > 0;
        const sub = it.subtotal || 0;
        if (isGelato) {
          gelatoRev += sub;
          // 메뉴: "1가지맛" 식으로 그룹 (itemName에서 가지수 추출)
          const m = it.itemName.match(/(\d가지맛)/);
          const key = m ? m[1] : it.itemName;
          menuMap[key] = menuMap[key] || { qty: 0, revenue: 0 };
          menuMap[key].qty += it.quantity;
          menuMap[key].revenue += sub;
          // 맛별 카운트 (저장 형식이 string 또는 {name} 둘 다 가능 — 방어적 처리)
          for (const f of it.selectedFlavors! as unknown[]) {
            const fname = typeof f === "string" ? f : (f as { name?: string })?.name;
            if (fname) flavorMap[fname] = (flavorMap[fname] || 0) + it.quantity;
          }
        } else {
          drinkRev += sub;
          const key = it.itemName;
          drinkMap[key] = drinkMap[key] || { qty: 0, revenue: 0 };
          drinkMap[key].qty += it.quantity;
          drinkMap[key].revenue += sub;
          menuMap[key] = menuMap[key] || { qty: 0, revenue: 0 };
          menuMap[key].qty += it.quantity;
          menuMap[key].revenue += sub;
        }
      }
    }

    const topMenus = Object.entries(menuMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty);
    const topFlavors = Object.entries(flavorMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
    const topDrinks = Object.entries(drinkMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
    const dailyArr = Object.entries(dailyMap)
      .map(([date, rev]) => ({ date, rev }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue, orderCount, avgOrder,
      dineIn, takeaway, dineInRev, takeawayRev,
      gelatoRev, drinkRev,
      topMenus, topFlavors, topDrinks, hourly, dailyArr,
    };
  }, [orders]);

  const periodLabel = PERIODS.find((p) => p.key === period)?.label || "";
  const maxHour = Math.max(...stats.hourly, 1);
  const maxDaily = Math.max(...stats.dailyArr.map((d) => d.rev), 1);

  const csvDownload = () => {
    if (orders.length === 0) return;
    const BOM = "﻿";
    const header = "주문번호,유형,메뉴,합계,주문시간\n";
    const rows = orders.filter((o) => o.status !== "cancelled").map((o) => {
      const items = o.items.map((i) => `${i.itemName}${i.optionName ? ` (${i.optionName})` : ""}`).join(" / ");
      const time = new Date(o.createdAt).toLocaleString("ko-KR");
      return `${o.orderNumber},${o.orderType === "dine_in" ? "매장식사" : "포장"},"${items}",${o.totalAmount},${time}`;
    }).join("\n");
    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `판매내역_${rangeFor(period).from}_${rangeFor(period).to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700"><ChevronLeft size={20} /></Link>
            <h1 className="text-lg font-bold text-gray-900">판매 분석</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
            >
              {activeStores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-gray-100">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* 기간 선택 (토글 pill) */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                period === p.key
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-[#1B4332]/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-[3px] border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 헤드라인 매출 */}
            <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-[#D4A574]" />
                <p className="text-[12px] tracking-wider text-white/60 uppercase">{periodLabel} 총 매출</p>
              </div>
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight">{won(stats.totalRevenue)}</p>
              <div className="flex gap-5 mt-4 pt-4 border-t border-white/15">
                <div>
                  <p className="text-[11px] text-white/50">주문 건수</p>
                  <p className="text-xl font-bold">{stats.orderCount}<span className="text-sm font-medium text-white/60 ml-0.5">건</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-white/50">평균 객단가</p>
                  <p className="text-xl font-bold">{won(stats.avgOrder)}</p>
                </div>
              </div>
            </div>

            {/* 주문 유형 + 카테고리 매출 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-[12px] text-gray-400 font-medium mb-3">주문 유형</p>
                <div className="space-y-2.5">
                  <TypeBar label="매장식사" count={stats.dineIn} revenue={stats.dineInRev} total={stats.dineIn + stats.takeaway} color="bg-[#1B4332]" />
                  <TypeBar label="포장" count={stats.takeaway} revenue={stats.takeawayRev} total={stats.dineIn + stats.takeaway} color="bg-[#A68B5B]" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-[12px] text-gray-400 font-medium mb-3">카테고리 매출</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[12px] mb-1"><span className="text-gray-600">🍨 젤라또·소르베또</span><span className="font-bold text-[#1B4332]">{won(stats.gelatoRev)}</span></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1"><span className="text-gray-600">🥃 주류</span><span className="font-bold text-[#1B4332]">{won(stats.drinkRev)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 베스트셀러 메뉴 */}
            <Section icon={<ShoppingBag size={16} className="text-[#1B4332]" />} title="베스트셀러 메뉴" sub="판매 수량 기준">
              {stats.topMenus.length ? (
                <div className="space-y-3">
                  {stats.topMenus.slice(0, 8).map((m, i) => {
                    const max = stats.topMenus[0].qty || 1;
                    return (
                      <div key={m.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-gray-700 font-medium">
                            <span className="text-gray-300 mr-1.5">{i + 1}</span>{m.name}
                          </span>
                          <span className="text-[13px] text-gray-500"><strong className="text-[#1B4332]">{m.qty}개</strong> · {won(m.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#1B4332] to-[#40916C] rounded-full" style={{ width: `${(m.qty / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <Empty />}
            </Section>

            {/* 인기 젤라또 맛 */}
            <Section icon={<span className="text-base">🍨</span>} title="인기 젤라또 맛" sub="가장 많이 선택된 맛">
              {stats.topFlavors.length ? (
                <div className="space-y-2.5">
                  {stats.topFlavors.slice(0, 10).map((f, i) => {
                    const max = stats.topFlavors[0].qty || 1;
                    return (
                      <div key={f.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-gray-700"><span className="text-gray-300 mr-1.5">{i + 1}</span>{f.name}</span>
                          <span className="text-[13px] font-bold text-[#A68B5B]">{f.qty}회</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#A68B5B] to-[#D4A574] rounded-full" style={{ width: `${(f.qty / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <Empty />}
            </Section>

            {/* 주류 판매 */}
            {stats.topDrinks.length > 0 && (
              <Section icon={<span className="text-base">🥃</span>} title="주류 판매" sub="매출 기준">
                <div className="space-y-2">
                  {stats.topDrinks.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-[13px] text-gray-700"><span className="text-gray-300 mr-1.5">{i + 1}</span>{d.name}</span>
                      <span className="text-[13px] text-gray-500"><strong className="text-[#1B4332]">{d.qty}잔</strong> · {won(d.revenue)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 시간대별 매출 */}
            <Section icon={<TrendingUp size={16} className="text-[#1B4332]" />} title="시간대별 매출" sub="언제 가장 많이 팔리나">
              {stats.totalRevenue > 0 ? (
                <div className="flex items-end gap-0.5 h-28">
                  {stats.hourly.map((rev, h) => {
                    if (h < 8 || h > 23) return null; // 영업시간대만 (8~23시)
                    const pct = rev > 0 ? Math.max((rev / maxHour) * 100, 6) : 2;
                    return (
                      <div key={h} className="flex-1 flex flex-col items-center gap-1" title={`${h}시: ${won(rev)}`}>
                        <div className={`w-full rounded-t-sm transition-all ${rev > 0 ? "bg-gradient-to-t from-[#1B4332] to-[#40916C]" : "bg-gray-100"}`} style={{ height: `${pct}%` }} />
                        <span className="text-[8px] text-gray-400">{h}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <Empty />}
            </Section>

            {/* 일별 매출 추이 (기간이 하루보다 길 때) */}
            {stats.dailyArr.length > 1 && (
              <Section icon={<Receipt size={16} className="text-[#1B4332]" />} title="일별 매출 추이">
                <div className="flex items-end gap-1 h-32">
                  {stats.dailyArr.map((d) => {
                    const pct = d.rev > 0 ? Math.max((d.rev / maxDaily) * 100, 5) : 2;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${won(d.rev)}`}>
                        <span className="text-[8px] font-bold text-gray-500">{d.rev > 0 ? Math.round(d.rev / 10000) + "만" : ""}</span>
                        <div className="w-full rounded-t-sm bg-gradient-to-t from-[#1B4332] to-[#40916C]" style={{ height: `${pct}%` }} />
                        <span className="text-[8px] text-gray-400">{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* CSV 다운로드 */}
            <button
              onClick={csvDownload}
              disabled={orders.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <Download size={15} /> 이 기간 판매내역 CSV 다운로드
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{title}</h2>
          {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function TypeBar({ label, count, revenue, total, color }: { label: string; count: number; revenue: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1">
        <span className="text-gray-600 font-medium">{label} <span className="text-gray-400">{count}건</span></span>
        <span className="font-bold text-[#1B4332]">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-gray-300 text-sm py-6 text-center">해당 기간에 판매 데이터가 없습니다</p>;
}
