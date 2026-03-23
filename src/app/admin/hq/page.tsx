"use client";

import { useState, useEffect } from "react";
import { Store, Users, MessageSquare, Eye } from "lucide-react";

interface DashboardStats {
  activeStores: number;
  totalEmployees: number;
  inquiries: number;
  todayVisitors: number;
}

export default function HQDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeStores: 0,
    totalEmployees: 0,
    inquiries: 0,
    todayVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 매장 수 조회
        const storesRes = await fetch("/api/fms/stores?status=active", { cache: "no-store" });
        let activeStores = 0;
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          activeStores = storesData.stores?.length || 0;
        }

        // 직원 수 조회 (간단히 API에서)
        let totalEmployees = 0;
        try {
          const empRes = await fetch("/api/fms/employees?count=true", { cache: "no-store" });
          if (empRes.ok) {
            const empData = await empRes.json();
            totalEmployees = empData.count || 0;
          }
        } catch {}

        // 가맹문의 수
        let inquiries = 0;
        try {
          const inqRes = await fetch("/api/franchise?count=true", { cache: "no-store" });
          if (inqRes.ok) {
            const inqData = await inqRes.json();
            inquiries = inqData.count || inqData.inquiries?.length || 0;
          }
        } catch {}

        // 오늘 방문자
        let todayVisitors = 0;
        try {
          const visitRes = await fetch("/api/analytics", { cache: "no-store" });
          if (visitRes.ok) {
            const visitData = await visitRes.json();
            todayVisitors = visitData.todayVisits || 0;
          }
        } catch {}

        setStats({ activeStores, totalEmployees, inquiries, todayVisitors });
      } catch (err) {
        console.error("대시보드 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "운영 매장", value: stats.activeStores, icon: <Store size={24} />, color: "#1B4332" },
    { label: "전체 직원", value: stats.totalEmployees, icon: <Users size={24} />, color: "#2D6A4F" },
    { label: "가맹문의", value: stats.inquiries, icon: <MessageSquare size={24} />, color: "#A68B5B" },
    { label: "오늘 방문자", value: stats.todayVisitors, icon: <Eye size={24} />, color: "#6B5B4E" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">대시보드</h2>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{card.label}</span>
              <div className="p-2 rounded-lg" style={{ backgroundColor: card.color + "15", color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-2">FMS 시스템 구축 중</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          가맹점 관리 시스템(FMS)이 단계적으로 구축되고 있습니다.
          매장관리, 발주관리, AI 채팅 등의 기능이 순차적으로 추가됩니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/admin/inquiries" className="text-xs px-3 py-1.5 bg-[#1B4332] text-white rounded-full hover:bg-[#2D6A4F]">
            가맹문의 관리 →
          </a>
          <a href="/admin/orders" className="text-xs px-3 py-1.5 bg-[#A68B5B] text-white rounded-full hover:bg-[#8B7548]">
            QR 주문 관리 →
          </a>
        </div>
      </div>
    </div>
  );
}
