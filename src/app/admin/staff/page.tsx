"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ClipboardList, Megaphone, UtensilsCrossed, ShoppingCart, ArrowRight, Clock, LogIn, LogOut } from "lucide-react";
import NotificationSettings from "@/components/fms/NotificationSettings";

export default function StaffDashboard() {
  const [userName, setUserName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  // 출퇴근
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  const [clockLoading, setClockLoading] = useState(false);
  // 시간대 업무
  const [currentTasks, setCurrentTasks] = useState<string[]>([]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch("/api/fms/attendance", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const active = (data.records || []).find((r: any) => !r.clock_out);
      if (active) {
        setIsClockedIn(true);
        setClockInTime(active.clock_in);
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
      }
    } catch {}
  }, []);

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

    // 출퇴근 상태
    fetchAttendance();

    // 시간대 업무 규칙
    fetch("/api/fms/time-rules", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const now = new Date();
        const kstHour = (now.getUTCHours() + 9) % 24;
        const rules = (d.rules || []).filter((r: any) =>
          r.start_hour <= kstHour && kstHour < r.end_hour
        );
        const tasks = rules.flatMap((r: any) => r.tasks || []);
        setCurrentTasks(tasks);
      }).catch(() => {});
  }, [fetchAttendance]);

  // 근무 시간 실시간 업데이트
  useEffect(() => {
    if (!isClockedIn || !clockInTime) return;
    const update = () => {
      const diff = Math.round((Date.now() - new Date(clockInTime).getTime()) / 60000);
      setWorkingMinutes(diff);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [isClockedIn, clockInTime]);

  const handleClock = async (action: "clock_in" | "clock_out") => {
    setClockLoading(true);
    try {
      // GPS 위치 가져오기
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (geoErr: any) {
        if (geoErr?.code === 1) {
          alert("위치 권한이 필요합니다.\n설정 → 사이트 설정 → 위치에서 허용해주세요.");
          setClockLoading(false);
          return;
        }
        // 위치를 못 가져와도 서버에서 판단 (GPS 미설정 매장은 통과)
      }

      const res = await fetch("/api/fms/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, latitude, longitude }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "clock_in") {
          setIsClockedIn(true);
          setClockInTime(data.clockIn);
          setWorkingMinutes(0);
          if (data.distance !== null && data.distance !== undefined) {
            // 성공 시 거리 표시 (선택)
          }
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
          setWorkingMinutes(0);
          if (data.workMinutes) {
            alert(`퇴근 완료! 오늘 근무시간: ${Math.floor(data.workMinutes / 60)}시간 ${data.workMinutes % 60}분`);
          }
        }
      } else {
        alert(data.error || "오류 발생");
      }
    } catch {
      alert("네트워크 오류");
    } finally {
      setClockLoading(false);
    }
  };

  const fmtMinutes = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}시간 ${min}분` : `${min}분`;
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

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
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            안녕하세요, {userName || "..."}님 👋
          </h1>
          {storeName && <p className="text-sm text-gray-500 mt-1">{storeName}</p>}
        </div>
        <NotificationSettings />
      </div>

      {/* 출퇴근 카드 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1B4332]" />
            <span className="text-sm font-bold text-gray-800">출퇴근</span>
          </div>
          {isClockedIn && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              근무 중 · {fmtMinutes(workingMinutes)}
            </span>
          )}
        </div>

        {isClockedIn && clockInTime && (
          <p className="text-xs text-gray-400 mb-3">출근 시간: {fmtTime(clockInTime)}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleClock("clock_in")}
            disabled={isClockedIn || clockLoading}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              isClockedIn
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#1B4332] text-white active:scale-95"
            }`}
          >
            <LogIn size={16} />
            출근
          </button>
          <button
            onClick={() => handleClock("clock_out")}
            disabled={!isClockedIn || clockLoading}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              !isClockedIn
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-500 text-white active:scale-95"
            }`}
          >
            <LogOut size={16} />
            퇴근
          </button>
        </div>
      </div>

      {/* 지금 해야 할 일 (시간대별 업무) */}
      {currentTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 mb-2">📋 지금 해야 할 일</p>
          <div className="space-y-1">
            {currentTasks.map((task, i) => (
              <p key={i} className="text-xs text-amber-700">• {task}</p>
            ))}
          </div>
        </div>
      )}

      {/* 메뉴 카드 */}
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
