"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Megaphone, UtensilsCrossed, ShoppingCart, ArrowRight } from "lucide-react";

export default function StaffDashboard() {
  const [userName, setUserName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  useEffect(() => {
    // 사용자 정보
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setUserName(d.user?.name || "");
        setStoreName(d.user?.storeName || "");
      }).catch(() => {});

    // 오늘 할일 개수
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/fms/tasks?date=${today}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const pending = (d.tasks || []).filter((t: any) => t.status !== "completed").length;
        setTaskCount(pending);
      }).catch(() => {});

    // 미읽은 공지
    fetch("/api/fms/announcements", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const unread = (d.announcements || []).filter((a: any) => !a.isRead).length;
        setUnreadAnnouncements(unread);
      }).catch(() => {});
  }, []);

  const menuCards = [
    {
      href: "/admin/staff/tasks",
      icon: <ClipboardList size={24} className="text-[#1B4332]" />,
      title: "오늘의 할 일",
      desc: taskCount > 0 ? `${taskCount}개 남음` : "모두 완료!",
      badge: taskCount > 0 ? taskCount : null,
      color: "bg-green-50",
    },
    {
      href: "/admin/staff/announcements",
      icon: <Megaphone size={24} className="text-orange-500" />,
      title: "공지사항",
      desc: unreadAnnouncements > 0 ? `${unreadAnnouncements}개 새 공지` : "새 공지 없음",
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : null,
      color: "bg-orange-50",
    },
    {
      href: "/admin/staff/menu",
      icon: <UtensilsCrossed size={24} className="text-blue-500" />,
      title: "메뉴 ON/OFF",
      desc: "품절 메뉴 관리",
      badge: null,
      color: "bg-blue-50",
    },
    {
      href: "/admin/staff/orders",
      icon: <ShoppingCart size={24} className="text-purple-500" />,
      title: "발주 내역",
      desc: "본사 발주 현황 확인",
      badge: null,
      color: "bg-purple-50",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          안녕하세요, {userName}님 👋
        </h1>
        {storeName && <p className="text-sm text-gray-500 mt-1">{storeName}</p>}
      </div>

      <div className="space-y-3">
        {menuCards.map(card => (
          <Link key={card.href} href={card.href}
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800">{card.title}</p>
                  {card.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{card.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300" />
            </div>
          </Link>
        ))}
      </div>

      {/* AI 채팅 안내 */}
      <div className="mt-6 bg-[#1B4332]/5 rounded-xl p-4">
        <p className="text-sm font-medium text-[#1B4332] mb-1">💬 AI 어시스턴트</p>
        <p className="text-xs text-gray-500">우하단 채팅 버튼으로 작업 보고, 발주, 질문이 가능합니다</p>
        <p className="text-xs text-gray-400 mt-1">예: &quot;피스타치오 5통 만들었어&quot; · &quot;오늘 할 일 뭐야?&quot;</p>
      </div>
    </div>
  );
}
