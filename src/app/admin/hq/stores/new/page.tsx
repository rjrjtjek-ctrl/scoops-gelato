"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function NewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ storeName: string; loginId: string; password: string } | null>(null);
  const [error, setError] = useState("");

  const [store, setStore] = useState({ name: "", address: "", areaSqm: "", seats: "", businessHours: "10:00 ~ 22:00", phone: "", openDate: "", notes: "" });
  const [owner, setOwner] = useState({ name: "", phone: "", email: "", loginId: "", password: "scoops1234!" });

  const handleStoreNameChange = (name: string) => {
    setStore({ ...store, name });
    // 로그인 아이디 자동 생성 제안
    if (!owner.loginId || owner.loginId.startsWith("store_")) {
      const slug = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10) || "store" + Date.now().toString().slice(-4);
      setOwner({ ...owner, loginId: `store_${slug}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/fms/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: { ...store, areaSqm: store.areaSqm ? Number(store.areaSqm) : null, seats: store.seats ? Number(store.seats) : null },
          owner,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "등록 실패"); return; }

      setSuccess({ storeName: store.name, loginId: owner.loginId, password: owner.password });
    } catch { setError("서버 오류"); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{success.storeName} 등록 완료</h2>
          <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
            <p className="text-sm text-gray-600 mb-1">점주 로그인 정보:</p>
            <p className="text-sm font-mono"><strong>ID:</strong> {success.loginId}</p>
            <p className="text-sm font-mono"><strong>PW:</strong> {success.password}</p>
          </div>
          <button onClick={() => router.push("/admin/hq/stores")} className="mt-6 px-6 py-2 bg-[#1B4332] text-white rounded-lg text-sm">
            매장 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/hq/stores" className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
        <ArrowLeft size={16} /> 매장 목록
      </Link>
      <h2 className="text-lg font-bold text-gray-800 mb-6">매장 등록</h2>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 매장 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">매장 정보</h3>
          <div className="grid gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">매장명 *</label><input required value={store.name} onChange={e => handleStoreNameChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">주소</label><input value={store.address} onChange={e => setStore({...store, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">면적(평)</label><input type="number" value={store.areaSqm} onChange={e => setStore({...store, areaSqm: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">좌석수</label><input type="number" value={store.seats} onChange={e => setStore({...store, seats: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">영업시간</label><input value={store.businessHours} onChange={e => setStore({...store, businessHours: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">전화번호</label><input value={store.phone} onChange={e => setStore({...store, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            </div>
            <div><label className="block text-xs text-gray-500 mb-1">개업일</label><input type="date" value={store.openDate} onChange={e => setStore({...store, openDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">메모</label><textarea value={store.notes} onChange={e => setStore({...store, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" /></div>
          </div>
        </div>

        {/* 점주 계정 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">점주 계정</h3>
          <div className="grid gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">점주 이름 *</label><input required value={owner.name} onChange={e => setOwner({...owner, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">전화번호</label><input value={owner.phone} onChange={e => setOwner({...owner, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">이메일</label><input type="email" value={owner.email} onChange={e => setOwner({...owner, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">로그인 아이디 *</label><input required value={owner.loginId} onChange={e => setOwner({...owner, loginId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">임시 비밀번호 *</label><input required value={owner.password} onChange={e => setOwner({...owner, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-[#1B4332] text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? "등록 중..." : "매장 등록"}
        </button>
      </form>
    </div>
  );
}
