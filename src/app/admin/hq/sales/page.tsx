"use client";

import { useState, useEffect } from "react";

export default function HQSalesPage() {
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/fms/stores?status=active", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStores((d.stores || []).map((s: any) => ({ id: s.id, name: s.name }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    setLoading(true);
    fetch(`/api/fms/sales?storeId=${selectedStore}&period=today`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setSummary(d.summary || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStore]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">전체 매장 판매 현황</h2>
      <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="mb-6 px-4 py-2 border rounded-lg text-sm w-full max-w-xs">
        <option value="">매장 선택</option>
        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {!selectedStore ? <div className="text-center py-12 text-gray-400">매장을 선택해주세요.</div> :
      loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">오늘 매출</p>
            <p className="text-xl font-bold text-[#1B4332]">{summary.totalRevenue.toLocaleString()}원</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">주문 수</p>
            <p className="text-xl font-bold text-gray-800">{summary.totalOrders}건</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">객단가</p>
            <p className="text-xl font-bold text-gray-800">{summary.avgOrderValue.toLocaleString()}원</p>
          </div>
        </div>
      )}
    </div>
  );
}
