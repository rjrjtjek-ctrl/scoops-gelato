"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store, Users, MessageSquare, Eye, ShoppingCart,
  AlertCircle, TrendingUp, ListTodo, ArrowRight
} from "lucide-react";

export default function HQDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, inquiriesRes, ordersRes, visitsRes] = await Promise.allSettled([
          fetch("/api/fms/analytics/overview", { cache: "no-store" }).then(r => r.json()),
          fetch("/api/franchise?count=true", { cache: "no-store" }).then(r => r.json()).catch(() => ({ count: 0 })),
          fetch("/api/fms/hq-orders?status=pending", { cache: "no-store" }).then(r => r.json()).catch(() => ({ orders: [] })),
          fetch("/api/analytics", { cache: "no-store" }).then(r => r.json()).catch(() => ({ todayVisits: 0 })),
        ]);

        setStats({
          storeCount: analyticsRes.status === "fulfilled" ? analyticsRes.value.storeCount || 0 : 0,
          employeeCount: analyticsRes.status === "fulfilled" ? analyticsRes.value.employeeCount || 0 : 0,
          todayOrders: analyticsRes.status === "fulfilled" ? analyticsRes.value.todayOrders || 0 : 0,
          todayRevenue: analyticsRes.status === "fulfilled" ? analyticsRes.value.todayRevenue || 0 : 0,
          pendingOrders: ordersRes.status === "fulfilled" ? (ordersRes.value.orders || []).length : 0,
          inquiries: inquiriesRes.status === "fulfilled" ? (inquiriesRes.value.count || inquiriesRes.value.inquiries?.length || 0) : 0,
          todayVisitors: visitsRes.status === "fulfilled" ? visitsRes.value.todayVisits || 0 : 0,
        });
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">대시보드 로딩 중...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">관제 센터</h1>
          <p className="text-xs text-gray-400 mt-0.5">실시간 현황 · 30초 자동 갱신</p>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="오늘 매출" value={`${(stats?.todayRevenue || 0).toLocaleString()}원`} icon={<TrendingUp size={20} />} color="#1B4332" href="/admin/orders/analytics" />
        <StatCard label="오늘 주문" value={`${stats?.todayOrders || 0}건`} icon={<ShoppingCart size={20} />} color="#2D6A4F" href="/admin/orders" />
        <StatCard label="운영 매장" value={`${stats?.storeCount || 0}개`} icon={<Store size={20} />} color="#A68B5B" href="/admin/hq/stores" />
        <StatCard label="전체 직원" value={`${stats?.employeeCount || 0}명`} icon={<Users size={20} />} color="#6B5B4E" href="/admin/store/employees" />
      </div>

      {/* 긴급 알림 */}
      {(stats?.pendingOrders > 0 || stats?.inquiries > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-l-4 border-red-400">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-500" /> 처리 필요
          </h3>
          <div className="grid gap-2">
            {stats?.pendingOrders > 0 && (
              <Link href="/admin/hq/orders" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={16} className="text-red-500" />
                  <span className="text-sm text-gray-700">신규 발주 <strong className="text-red-600">{stats.pendingOrders}건</strong> 대기 중</span>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
            )}
            {stats?.inquiries > 0 && (
              <Link href="/admin/inquiries" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-700">가맹문의 <strong className="text-orange-600">{stats.inquiries}건</strong></span>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 빠른 이동 */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <QuickAction title="QR 주문 실시간" desc="POS 주문 모니터링" href="/admin/orders" icon={<QrCode size={20} />} />
        <QuickAction title="방문자 통계" desc="홈페이지 트래픽 분석" href="/admin/analytics" icon={<Eye size={20} />} />
        <QuickAction title="할일 · 작업관리" desc="점주/직원 작업 현황" href="/admin/store/tasks" icon={<ListTodo size={20} />} />
      </div>

      {/* 설명 카드 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-3">사용 가이드</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-1">🏢 본사 관리</p>
            <p>매장 등록, 발주 승인, 메뉴 관리, 공지 작성, AI 지식베이스 관리</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">🏪 점주 기능 (열람)</p>
            <p>점주가 직원에게 배정한 할일, 작업기록, 메뉴 품절 설정, 매장 판매현황</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">📊 운영 도구</p>
            <p>QR 주문 실시간 관리, 주문 분석, 가맹문의, 방문자 통계, 고객의소리</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">💬 AI 채팅</p>
            <p>우하단 채팅 버튼으로 AI에게 가격비교, 발주, 운영 질문 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, href }: { label: string; value: string; icon: React.ReactNode; color: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-500">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: color + "15", color }}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </Link>
  );
}

function QuickAction({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="p-3 bg-gray-100 rounded-xl text-gray-500">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-300 ml-auto" />
    </Link>
  );
}

function QrCode({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>;
}
