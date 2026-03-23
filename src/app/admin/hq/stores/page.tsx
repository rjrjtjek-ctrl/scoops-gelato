"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  openDate: string;
  owner: { name: string; phone: string } | null;
}

export default function HQStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fms/stores", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">매장 관리</h2>
        <Link
          href="/admin/hq/stores/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg hover:bg-[#2D6A4F]"
        >
          <Plus size={16} /> 매장 등록
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 매장이 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">매장명</th>
                  <th className="text-left px-4 py-3 font-medium">주소</th>
                  <th className="text-left px-4 py-3 font-medium">점주</th>
                  <th className="text-left px-4 py-3 font-medium">연락처</th>
                  <th className="text-left px-4 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/admin/hq/stores/${store.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{store.name}</td>
                    <td className="px-4 py-3 text-gray-500">{store.address || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{store.owner?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{store.phone || store.owner?.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${store.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {store.status === "active" ? "운영중" : "비활성"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="md:hidden divide-y divide-gray-100">
            {stores.map((store) => (
              <Link key={store.id} href={`/admin/hq/stores/${store.id}`} className="block p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{store.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${store.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {store.status === "active" ? "운영중" : "비활성"}
                  </span>
                </div>
                {store.address && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <MapPin size={12} /> {store.address}
                  </div>
                )}
                <p className="text-xs text-gray-500">점주: {store.owner?.name || "-"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
