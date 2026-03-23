"use client";

import { useState, useEffect } from "react";

interface Order { id: string; items: any[]; status: string; createdAt: string; orderedByName: string; }

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/fms/hq-orders${query}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setOrders((d.orders || []).map((o: any) => ({
        ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const statusText: Record<string, string> = { pending: "대기", confirmed: "확인", completed: "완료" };
  const statusColor: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-600", completed: "bg-green-100 text-green-600" };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">발주 내역</h2>
      <p className="text-sm text-gray-500 mb-4">발주는 AI 채팅에서 가능합니다. (예: &quot;클래식 베이스 2개 주문해줘&quot;)</p>

      <div className="flex gap-2 mb-4">
        {[{ key: "all", label: "전체" }, { key: "pending", label: "대기" }, { key: "confirmed", label: "확인" }, { key: "completed", label: "완료" }].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs ${filter === t.key ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}
          >{t.label}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      orders.length === 0 ? <div className="text-center py-12 text-gray-400">발주 내역이 없습니다.</div> : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">
                  {(o.items || []).map((i: any) => `${i.productName} x${i.quantity}`).join(", ")}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[o.status] || ""}`}>
                  {statusText[o.status] || o.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString("ko-KR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
