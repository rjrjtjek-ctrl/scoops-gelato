"use client";

import { useState, useEffect } from "react";
import { Store, Users, ShoppingCart, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";

export default function HQAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fms/analytics/overview", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">로딩 중...</div>;

  const cards = [
    { label: "운영 매장", value: data?.storeCount || 0, icon: <Store size={20} />, color: "#1B4332" },
    { label: "전체 직원", value: data?.employeeCount || 0, icon: <Users size={20} />, color: "#2D6A4F" },
    { label: "오늘 주문", value: data?.todayOrders || 0, icon: <ShoppingCart size={20} />, color: "#A68B5B" },
    { label: "오늘 매출", value: `${(data?.todayRevenue || 0).toLocaleString()}원`, icon: <TrendingUp size={20} />, color: "#1B4332" },
    { label: "발주 대기", value: data?.pendingOrders || 0, icon: <AlertCircle size={20} />, color: "#DC2626" },
    { label: "가맹문의", value: data?.recentInquiries || 0, icon: <MessageSquare size={20} />, color: "#7C3AED" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-6">종합 분석</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{card.label}</span>
              <div className="p-2 rounded-lg" style={{ backgroundColor: card.color + "15", color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-3">FMS 분석 기능</h3>
        <p className="text-sm text-gray-500">
          데이터가 축적되면 매장별 매출 순위, 인기 메뉴, AI 질문 패턴 등 상세 분석이 가능합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/admin/hq/sales" className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">판매 현황 →</a>
          <a href="/admin/hq/work-analysis" className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">작업 분석 →</a>
          <a href="/admin/hq/stores" className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">매장 관리 →</a>
        </div>
      </div>
    </div>
  );
}
