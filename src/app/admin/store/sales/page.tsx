"use client";

import { useState, useEffect } from "react";

export default function StoreSalesPage() {
  const [period, setPeriod] = useState("today");
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fms/sales?period=${period}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setSummary(d.summary || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">판매 현황</h2>

      <div className="flex gap-2 mb-6">
        {[{ k: "today", l: "오늘" }, { k: "week", l: "이번주" }, { k: "month", l: "이번달" }].map(t => (
          <button key={t.k} onClick={() => setPeriod(t.k)}
            className={`px-4 py-2 rounded-lg text-sm ${period === t.k ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}
          >{t.l}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">총 매출</p>
            <p className="text-xl font-bold text-[#1B4332]">{summary.totalRevenue.toLocaleString()}원</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">총 주문</p>
            <p className="text-xl font-bold text-gray-800">{summary.totalOrders}건</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">평균 객단가</p>
            <p className="text-xl font-bold text-gray-800">{summary.avgOrderValue.toLocaleString()}원</p>
          </div>
        </div>
      )}
    </div>
  );
}
