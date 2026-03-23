"use client";

import { useState, useEffect } from "react";

interface Order { id: string; items: any[]; status: string; createdAt: string; }

const statusText: Record<string, string> = { pending: "대기", confirmed: "확인", completed: "완료" };
const statusColor: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-600", completed: "bg-green-100 text-green-600" };

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fms/hq-orders", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setOrders((d.orders || []).map((o: any) => ({
        ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">매장 발주내역</h2>
      <p className="text-xs text-gray-500 mb-4">AI 채팅에서 &quot;클래식 베이스 2개 주문&quot; 하면 발주가 생성됩니다</p>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">📦</p>
          <h3 className="font-bold text-gray-800 mb-1">발주내역이 없습니다</h3>
          <p className="text-sm text-gray-500">우하단 채팅 버튼에서 AI에게 발주를 요청해보세요</p>
          <p className="text-xs text-gray-400 mt-2">예: &quot;클래식 베이스 2개 주문해줘&quot;</p>
        </div>
      ) : (
        <div className="space-y-2">
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
