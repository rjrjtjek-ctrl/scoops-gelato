"use client";

import { useEffect, useState } from "react";

export default function StoreDashboard() {
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStoreName(d.user?.storeName || "매장"))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">{storeName} 관리 페이지</h2>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500">
          시스템 구축 중입니다. 직원관리, 메뉴관리, 발주내역 등의 기능이 순차적으로 추가됩니다.
        </p>
      </div>
    </div>
  );
}
