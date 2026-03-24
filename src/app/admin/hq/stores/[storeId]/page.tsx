"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus, UserX, UserCheck, Store } from "lucide-react";
import Link from "next/link";

export default function StoreDetailPage() {
  const { storeId } = useParams();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  // 점주 등록 폼
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", phone: "", email: "", loginId: "", password: "scoops1234!" });
  const [ownerCreating, setOwnerCreating] = useState(false);
  const [ownerError, setOwnerError] = useState("");

  const fetchStore = () => {
    setLoading(true);
    fetch(`/api/fms/stores/${storeId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => { setStore(d.store); setOwner(d.owner); setEmployees(d.employees || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStore(); }, [storeId]);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`/api/fms/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });
      if (res.ok) setMsg("저장되었습니다.");
      else setMsg("저장 실패");
    } catch { setMsg("오류 발생"); }
    finally { setSaving(false); }
  };

  const handleDeactivateOwner = async () => {
    if (!confirm(`${owner.name} 점주 계정을 비활성화하시겠습니까?\n로그인이 불가능해집니다.`)) return;
    const res = await fetch(`/api/fms/users/${owner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    if (res.ok) {
      setOwner({ ...owner, isActive: false });
    } else {
      alert("비활성화 실패");
    }
  };

  const handleActivateOwner = async () => {
    const res = await fetch(`/api/fms/users/${owner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) {
      setOwner({ ...owner, isActive: true });
    }
  };

  const handleCreateOwner = async () => {
    setOwnerCreating(true); setOwnerError("");
    if (!newOwner.name || !newOwner.loginId || !newOwner.password) {
      setOwnerError("이름, 아이디, 비밀번호는 필수입니다.");
      setOwnerCreating(false);
      return;
    }
    try {
      const res = await fetch(`/api/fms/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createOwner: newOwner }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOwnerForm(false);
        fetchStore(); // 새로고침
      } else {
        setOwnerError(data.error || "생성 실패");
      }
    } catch {
      setOwnerError("네트워크 오류");
    } finally {
      setOwnerCreating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">로딩 중...</div>;
  if (!store) return <div className="text-center py-12 text-gray-400">매장을 찾을 수 없습니다.</div>;

  const activeOwner = owner && owner.isActive !== false;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/hq/stores" className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
        <ArrowLeft size={16} /> 매장 목록
      </Link>

      {/* 매장 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-[#1B4332]" />
            <h3 className="font-semibold text-gray-800">매장 정보</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {store.status === "active" ? "운영중" : "비활성 (운영 중단)"}
          </span>
        </div>
        <div className="grid gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">매장명</label><input value={store.name || ""} onChange={e => setStore({...store, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">주소</label><input value={store.address || ""} onChange={e => setStore({...store, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">영업시간</label><input value={store.businessHours || ""} onChange={e => setStore({...store, businessHours: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">전화번호</label><input value={store.phone || ""} onChange={e => setStore({...store, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">메모</label><textarea value={store.notes || ""} onChange={e => setStore({...store, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" /></div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg disabled:opacity-50">
            <Save size={14} /> {saving ? "저장 중..." : "저장"}
          </button>
          {store.status === "active" ? (
            <button onClick={async () => {
              if (!confirm("매장을 비활성화하시겠습니까?\n데이터는 삭제되지 않으며, 운영 중단 상태로 전환됩니다.")) return;
              await fetch(`/api/fms/stores/${storeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "inactive" }) });
              setStore({ ...store, status: "inactive" });
              setMsg("매장이 비활성화되었습니다. (데이터는 유지됨)");
            }} className="text-xs px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">매장 비활성화</button>
          ) : (
            <button onClick={async () => {
              await fetch(`/api/fms/stores/${storeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "active" }) });
              setStore({ ...store, status: "active" });
              setMsg("매장이 다시 활성화되었습니다.");
            }} className="text-xs px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">매장 활성화</button>
          )}
          {msg && <span className="text-sm text-green-600">{msg}</span>}
        </div>
      </div>

      {/* 점주 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">점주 정보</h3>
          {!activeOwner && !showOwnerForm && (
            <button onClick={() => setShowOwnerForm(true)} className="flex items-center gap-1 text-xs px-3 py-1 bg-[#1B4332] text-white rounded-lg">
              <UserPlus size={12} /> 점주 등록
            </button>
          )}
        </div>

        {/* 점주 등록 폼 */}
        {showOwnerForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">새 점주 등록</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">이름 *</label><input value={newOwner.name} onChange={e => setNewOwner({...newOwner, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">전화번호</label><input value={newOwner.phone} onChange={e => setNewOwner({...newOwner, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">로그인 ID *</label><input value={newOwner.loginId} onChange={e => setNewOwner({...newOwner, loginId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">비밀번호 *</label><input value={newOwner.password} onChange={e => setNewOwner({...newOwner, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
            </div>
            {ownerError && <p className="text-xs text-red-500">{ownerError}</p>}
            <div className="flex gap-2">
              <button onClick={handleCreateOwner} disabled={ownerCreating} className="px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg disabled:opacity-50">
                {ownerCreating ? "생성 중..." : "점주 등록"}
              </button>
              <button onClick={() => setShowOwnerForm(false)} className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg">취소</button>
            </div>
          </div>
        )}

        {owner ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">이름:</span> <span className="text-gray-800">{owner.name}</span></div>
              <div><span className="text-gray-500">아이디:</span> <span className="font-mono text-gray-800">{owner.loginId}</span></div>
              <div><span className="text-gray-500">전화:</span> <span className="text-gray-800">{owner.phone || "-"}</span></div>
              <div><span className="text-gray-500">이메일:</span> <span className="text-gray-800">{owner.email || "-"}</span></div>
              <div>
                <span className="text-gray-500">상태:</span>{" "}
                <span className={`font-medium ${activeOwner ? "text-green-600" : "text-red-500"}`}>
                  {activeOwner ? "활성" : "비활성 (로그인 불가)"}
                </span>
              </div>
            </div>
            <div className="mt-3">
              {activeOwner ? (
                <button onClick={handleDeactivateOwner} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <UserX size={12} /> 계정 비활성화
                </button>
              ) : (
                <button onClick={handleActivateOwner} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                  <UserCheck size={12} /> 계정 재활성화
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">등록된 점주가 없습니다. 위 &quot;점주 등록&quot; 버튼을 눌러주세요.</p>
        )}
      </div>

      {/* 직원 목록 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-3">소속 직원 ({employees.filter((e: any) => e.isActive).length}명)</h3>
        {employees.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 직원이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {employees.map((emp: any) => (
              <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-sm text-gray-800">{emp.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{/^[\uAC00-\uD7AF\u0020-\u007E]+$/.test(emp.position || '') ? emp.position : '알바'}</span>
                </div>
                <span className={`text-xs ${emp.isActive ? "text-green-600" : "text-gray-400"}`}>
                  {emp.isActive ? "재직" : "퇴사"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
