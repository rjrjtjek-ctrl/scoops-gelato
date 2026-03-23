"use client";

import { useState, useEffect } from "react";
import { Check, CheckCheck } from "lucide-react";

interface Order {
  id: string; storeName: string; orderedByName: string;
  items: { productName: string; quantity: number }[];
  status: string; createdAt: string;
}

export default function HQOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const query = filter === "all" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/fms/hq-orders${query}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setOrders((data.orders || []).map((o: any) => ({
        ...o,
        items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/fms/hq-orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const tabs = [
    { key: "all", label: "전체" },
    { key: "pending", label: "신규" },
    { key: "confirmed", label: "확인" },
    { key: "completed", label: "완료" },
  ];

  const statusBadge = (s: string) => {
    switch (s) {
      case "pending": return <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">신규</span>;
      case "confirmed": return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">확인</span>;
      case "completed": return <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">완료</span>;
      default: return null;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">발주 관리</h2>

      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${filter === t.key ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}
          >{t.label}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      orders.length === 0 ? <div className="text-center py-12 text-gray-400">발주 내역이 없습니다.</div> : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{o.storeName}</span>
                {statusBadge(o.status)}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {(o.items || []).map((i: any) => `${i.productName} x${i.quantity}`).join(", ")}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {o.orderedByName} · {new Date(o.createdAt).toLocaleString("ko-KR")}
              </p>
              <div className="flex gap-2">
                {o.status === "pending" && (
                  <button onClick={() => updateStatus(o.id, "confirmed")} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">
                    <Check size={14} /> 확인
                  </button>
                )}
                {o.status === "confirmed" && (
                  <button onClick={() => updateStatus(o.id, "completed")} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs">
                    <CheckCheck size={14} /> 처리완료
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
