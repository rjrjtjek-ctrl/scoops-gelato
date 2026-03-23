"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Megaphone } from "lucide-react";

export default function StaffDashboard() {
  const [userName, setUserName] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setUserName(d.user?.name || "");
        setStoreName(d.user?.storeName || "");
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">안녕하세요, {userName}님</h2>
      {storeName && <p className="text-sm text-gray-500 mb-6">{storeName}</p>}

      <div className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 opacity-50">
          <div className="p-3 bg-gray-100 rounded-lg">
            <ClipboardList size={20} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">오늘의 할 일</p>
            <p className="text-xs text-gray-400">준비 중</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 opacity-50">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Megaphone size={20} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">공지사항</p>
            <p className="text-xs text-gray-400">준비 중</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500">시스템 구축 중입니다.</p>
      </div>
    </div>
  );
}
