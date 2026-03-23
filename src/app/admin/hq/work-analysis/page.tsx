"use client";

import { useState, useEffect } from "react";

export default function HQWorkAnalysisPage() {
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/fms/stores", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStores((d.stores || []).filter((s: any) => s.status === "active")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/fms/task-logs?storeId=${selectedStore}&date=${today}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStore]);

  const workerStats = logs.reduce((acc: Record<string, number>, l: any) => {
    acc[l.userName] = (acc[l.userName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">작업 분석</h2>

      <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)}
        className="mb-6 px-4 py-2 border rounded-lg text-sm w-full max-w-xs">
        <option value="">매장 선택</option>
        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {!selectedStore ? <div className="text-center py-12 text-gray-400">매장을 선택해주세요.</div> :
      loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-3">오늘 작업 현황</h3>
            <p className="text-3xl font-bold text-[#1B4332]">{logs.length}건</p>
            <p className="text-sm text-gray-500 mt-1">기록된 작업</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-3">직원별 작업량</h3>
            {Object.entries(workerStats).length === 0 ? <p className="text-sm text-gray-400">데이터 없음</p> : (
              <div className="space-y-2">
                {Object.entries(workerStats).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{name}</span>
                    <span className="text-sm font-bold text-gray-800">{count as number}건</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
