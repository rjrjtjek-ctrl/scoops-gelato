"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ListTodo, UtensilsCrossed, BarChart3, ShoppingCart, Megaphone, ClipboardList, ArrowRight } from "lucide-react";

export default function StoreDashboard() {
  const [storeName, setStoreName] = useState("");
  const [userName, setUserName] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setStoreName(d.user?.storeName || "매장");
        setUserName(d.user?.name || "");
      }).catch(() => {});

    // 오늘 할일
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/fms/tasks?date=${today}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setTaskCount((d.tasks || []).filter((t: any) => t.status !== "completed").length))
      .catch(() => {});

    // 직원 수
    fetch("/api/fms/employees", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setEmployeeCount((d.employees || []).filter((e: any) => e.isActive).length))
      .catch(() => {});
  }, []);

  const menuCards = [
    { href: "/admin/store/employees", icon: <Users size={22} className="text-[#1B4332]" />, title: "직원 관리", desc: `${employeeCount}명 재직`, color: "bg-green-50" },
    { href: "/admin/store/tasks", icon: <ListTodo size={22} className="text-blue-500" />, title: "할일 관리", desc: taskCount > 0 ? `${taskCount}개 미완료` : "모두 완료!", color: "bg-blue-50", badge: taskCount > 0 ? taskCount : null },
    { href: "/admin/store/menu", icon: <UtensilsCrossed size={22} className="text-orange-500" />, title: "메뉴 ON/OFF", desc: "품절 메뉴 관리", color: "bg-orange-50" },
    { href: "/admin/store/sales", icon: <BarChart3 size={22} className="text-purple-500" />, title: "판매 현황", desc: "매출/주문 확인", color: "bg-purple-50" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{storeName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">안녕하세요, {userName}님</p>
      </div>

      {/* 메인 기능 카드 */}
      <div className="space-y-3 mb-6">
        {menuCards.map(card => (
          <Link key={card.href} href={card.href}
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color} shrink-0`}>{card.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-gray-800">{card.title}</p>
                  {card.badge && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{card.badge}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* 보조 기능 */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Link href="/admin/store/orders" className="bg-white rounded-xl shadow-sm p-3 text-center active:scale-[0.97]">
          <ShoppingCart size={18} className="mx-auto mb-1.5 text-gray-400" />
          <p className="text-[11px] text-gray-600">발주내역</p>
        </Link>
        <Link href="/admin/store/announcements" className="bg-white rounded-xl shadow-sm p-3 text-center active:scale-[0.97]">
          <Megaphone size={18} className="mx-auto mb-1.5 text-gray-400" />
          <p className="text-[11px] text-gray-600">공지사항</p>
        </Link>
        <Link href="/admin/store/tasks/logs" className="bg-white rounded-xl shadow-sm p-3 text-center active:scale-[0.97]">
          <ClipboardList size={18} className="mx-auto mb-1.5 text-gray-400" />
          <p className="text-[11px] text-gray-600">작업기록</p>
        </Link>
      </div>

      {/* AI 안내 */}
      <div className="bg-[#1B4332]/5 rounded-xl p-4">
        <p className="text-sm font-medium text-[#1B4332] mb-1">💬 AI 어시스턴트</p>
        <p className="text-xs text-gray-500">우하단 채팅 버튼으로 발주, 할일 배정, 운영 질문이 가능합니다</p>
        <p className="text-xs text-gray-400 mt-1">예: &quot;클래식 베이스 2개 주문해줘&quot; · &quot;김민수한테 청소 시켜줘&quot;</p>
      </div>
    </div>
  );
}
